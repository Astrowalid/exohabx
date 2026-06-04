import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SimulationParams, HabitabilityMetrics } from "../types";
import { getStarProps } from "../utils";
import { Info, Zap, Thermometer, Weight, Sparkles, Orbit } from "lucide-react";

interface ThreeCanvasProps {
  params: SimulationParams;
  metrics: HabitabilityMetrics;
}

interface LabelState {
  visible: boolean;
  target: "planet" | "star" | null;
  x: number;
  y: number;
}

export default function ThreeCanvas({ params, metrics }: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [label, setLabel] = useState<LabelState>({
    visible: false,
    target: null,
    x: 0,
    y: 0,
  });
  const labelTimerRef = useRef<NodeJS.Timeout | null>(null);

  const paramsRef = useRef<SimulationParams>(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const starMeshRef = useRef<THREE.Mesh | null>(null);
  const starGlowRef = useRef<THREE.Sprite | null>(null);
  const starLightRef = useRef<THREE.PointLight | null>(null);
  const starTextureRef = useRef<THREE.CanvasTexture | null>(null);
  
  const planetMeshRef = useRef<THREE.Mesh | null>(null);
  const planetPivotRef = useRef<THREE.Group | null>(null);
  const orbitLineRef = useRef<THREE.Line | null>(null);
  const planetTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const animationFrameId = useRef<number | null>(null);
  const planetAngleRef = useRef<number>(0);

  const drawProceduralPlanetMap = (canvas: HTMLCanvasElement, temp: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const generateNoisyPattern = (
      colors: string[], 
      density = 20, 
      clouds = false
    ) => {
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < density; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * (width * 0.25) + 10;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, colors[1] || colors[0]);
        if (colors[2]) grad.addColorStop(0.5, colors[2]);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (clouds) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        for (let j = 0; j < 12; j++) {
          const cy = Math.random() * height;
          ctx.beginPath();
          ctx.ellipse(
            Math.random() * width,
            cy,
            Math.random() * (width * 0.4) + 50,
            Math.random() * 25 + 5,
            Math.random() * 0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    };

    if (temp < 200) {
      generateNoisyPattern(["#dbeafe", "#bfdbfe", "#93c5fd"], 15, false);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, 0);
        ctx.bezierCurveTo(
          Math.random() * width,
          height * 0.3,
          Math.random() * width,
          height * 0.7,
          Math.random() * width,
          height
        );
        ctx.stroke();
      }
    } else if (temp < 250) {
      generateNoisyPattern(["#475569", "#cbd5e1", "#334155"], 18, true);
      const capGradTop = ctx.createLinearGradient(0, 0, 0, height * 0.2);
      capGradTop.addColorStop(0, "#f8fafc");
      capGradTop.addColorStop(1, "transparent");
      ctx.fillStyle = capGradTop;
      ctx.fillRect(0, 0, width, height * 0.2);

      const capGradBottom = ctx.createLinearGradient(0, height, 0, height * 0.8);
      capGradBottom.addColorStop(0, "#f8fafc");
      capGradBottom.addColorStop(1, "transparent");
      ctx.fillStyle = capGradBottom;
      ctx.fillRect(0, height * 0.8, width, height * 0.2);
    } else if (temp <= 315) {
      generateNoisyPattern(["#1e3a8a", "#065f46", "#15803d"], 14, true);
      
      ctx.fillStyle = "rgba(146, 100, 48, 0.45)"; 
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 50 + 20, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let c = 0; c < 8; c++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 80 + 40, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (temp < 380) {
      generateNoisyPattern(["#78350f", "#b45309", "#d97706"], 15, false);
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 10 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      generateNoisyPattern(["#1c1917", "#ef4444", "#090505"], 25, false);

      ctx.shadowBlur = 10;
      ctx.shadowColor = "#f97316";
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 4;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.bezierCurveTo(
          Math.random() * width,
          Math.random() * height,
          Math.random() * width,
          Math.random() * height,
          Math.random() * width,
          Math.random() * height
        );
        ctx.stroke();
      }
      ctx.shadowBlur = 0; 
    }
  };

  const drawProceduralStarMap = (canvas: HTMLCanvasElement, temp: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const starProps = getStarProps(temp);
    
    ctx.fillStyle = starProps.colorHex;
    ctx.fillRect(0, 0, width, height);

    const numSpots = 22;
    for (let i = 0; i < numSpots; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * (width * 0.28) + 20;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      const isSunspot = Math.random() > 0.65;
      if (isSunspot) {
        grad.addColorStop(0, "rgba(5, 5, 8, 0.75)");
        grad.addColorStop(0.5, starProps.glowHex);
      } else {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, starProps.colorHex);
      }
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.bezierCurveTo(
        width * 0.25, Math.random() * height,
        width * 0.75, Math.random() * height,
        width, Math.random() * height
      );
      ctx.stroke();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 18, 28);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 80;
    controls.minDistance = 2;

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x111122, 0.85);
    scene.add(hemisphereLight);

    const starProps = getStarProps(paramsRef.current.starTemp);
    
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 1024;
    starCanvas.height = 512;
    drawProceduralStarMap(starCanvas, paramsRef.current.starTemp);

    const starTexture = new THREE.CanvasTexture(starCanvas);
    starTexture.colorSpace = THREE.SRGBColorSpace;
    starTextureRef.current = starTexture;

    const starGeometry = new THREE.SphereGeometry(1.0, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: starTexture,
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    
    starMesh.scale.setScalar(starProps.sizeMultiplier * 3.0);
    scene.add(starMesh);
    starMeshRef.current = starMesh;

    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext("2d");
    if (glowCtx) {
      const grad = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
      grad.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
      grad.addColorStop(1, "transparent");
      glowCtx.fillStyle = grad;
      glowCtx.fillRect(0, 0, 256, 256);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const starGlowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color(starProps.glowHex),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.9,
    });
    const starGlow = new THREE.Sprite(starGlowMaterial);
    
    const glowScale = starProps.sizeMultiplier * 3.0 * 2.8;
    starGlow.scale.set(glowScale, glowScale, 1.0);
    
    scene.add(starGlow);
    starGlowRef.current = starGlow;

    const starLight = new THREE.PointLight(
      new THREE.Color(starProps.colorHex),
      15.0, 
      120,  
      0.65  
    );
    starMesh.add(starLight);
    starLightRef.current = starLight;

    const drawOrbitPath = (distanceAU: number, starTemp: number) => {
      const currentStarScale = getStarProps(starTemp).sizeMultiplier * 3.0;
      const sceneRadius = currentStarScale + 1.5 + (distanceAU * 8.0);

      const points: THREE.Vector3[] = [];
      const segments = 120;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * sceneRadius, 0, Math.sin(theta) * sceneRadius));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        linewidth: 1, 
      });

      if (orbitLineRef.current) {
        scene.remove(orbitLineRef.current);
        orbitLineRef.current.geometry.dispose();
      }

      const orbitLine = new THREE.Line(geometry, material);
      scene.add(orbitLine);
      orbitLineRef.current = orbitLine;
    };

    drawOrbitPath(paramsRef.current.orbitDistance, paramsRef.current.starTemp);

    const starfieldGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 80 + Math.random() * 60;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);

      const starRand = Math.random();
      if (starRand < 0.2) {
        starColors[i] = 1.0;
        starColors[i + 1] = 0.7;
        starColors[i + 2] = 0.7;
      } else if (starRand < 0.4) {
        starColors[i] = 0.8;
        starColors[i + 1] = 0.9;
        starColors[i + 2] = 1.0;
      } else {
        starColors[i] = 1.0;
        starColors[i + 1] = 1.0;
        starColors[i + 2] = 1.0;
      }
    }

    starfieldGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );
    starfieldGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(starColors, 3)
    );

    const starfieldMaterial = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const starfield = new THREE.Points(starfieldGeometry, starfieldMaterial);
    scene.add(starfield);

    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 1024;
    textureCanvas.height = 512;
    drawProceduralPlanetMap(textureCanvas, paramsRef.current.equilibriumTemp);

    const planetTexture = new THREE.CanvasTexture(textureCanvas);
    planetTexture.colorSpace = THREE.SRGBColorSpace;
    planetTextureRef.current = planetTexture;

    const planetPivot = new THREE.Group();
    scene.add(planetPivot);
    planetPivotRef.current = planetPivot;

    const planetGeometry = new THREE.SphereGeometry(1.0, 64, 64);
    const planetMaterial = new THREE.MeshPhongMaterial({
      map: planetTexture,
      shininess: 12,
      specular: new THREE.Color(0x333333),
    });

    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    
    const initialStarProps = getStarProps(paramsRef.current.starTemp);
    const initialStarScale = initialStarProps.sizeMultiplier * 3.0;
    const initialDistance = initialStarScale + 1.5 + (paramsRef.current.orbitDistance * 8.0);
    planetMesh.position.set(initialDistance, 0, 0);
    
    planetMesh.scale.setScalar(0.4 + paramsRef.current.planetRadius * 0.3);

    planetPivot.add(planetMesh);
    planetMeshRef.current = planetMesh;

    const animate = (time: number) => {
      const activeParams = paramsRef.current;
      time *= 0.001; 

      if (planetMeshRef.current) {
        planetMeshRef.current.rotation.y += 0.003;
      }

      const distanceFactor = Math.max(0.1, activeParams.orbitDistance);
      const orbitSpeed = 0.002 / Math.sqrt(Math.pow(distanceFactor, 1.5));
      planetAngleRef.current += orbitSpeed;

      const activeStarProps = getStarProps(activeParams.starTemp);
      const orbitStarScale = activeStarProps.sizeMultiplier * 3.0;
      const orbitalRadius = orbitStarScale + 1.5 + (activeParams.orbitDistance * 8.0);
      if (planetMeshRef.current) {
        planetMeshRef.current.position.x = Math.cos(planetAngleRef.current) * orbitalRadius;
        planetMeshRef.current.position.z = Math.sin(planetAngleRef.current) * orbitalRadius;
      }

      if (starMeshRef.current) {
        starMeshRef.current.rotation.y += 0.001;
        starMeshRef.current.rotation.x += 0.0004;
      }
      
      if (starGlowRef.current) {
        const baseGlowScale = activeStarProps.sizeMultiplier * 3.0 * 2.8;
        const fluctuation = Math.sin(time * 5.0) * 0.03 + Math.sin(time * 12.0) * 0.015;
        const currentGlowScale = baseGlowScale * (1.0 + fluctuation);
        
        starGlowRef.current.scale.set(currentGlowScale, currentGlowScale, 1.0);
        
        const glowMat = starGlowRef.current.material as THREE.SpriteMaterial;
        glowMat.opacity = Math.max(0.5, Math.min(1.0, 0.85 + (fluctuation * 3.0)));
      }

      if (starLightRef.current) {
        const baseIntensity = 15.0 * activeStarProps.sizeMultiplier;
        const lightFluctuation = Math.sin(time * 6.0) * 0.04;
        starLightRef.current.intensity = baseIntensity * (1.0 + lightFluctuation);
      }

      setLabel(prev => {
        if (!prev.visible || !prev.target || !cameraRef.current || !container) return prev;
        
        const targetMesh = prev.target === "planet" ? planetMeshRef.current : starMeshRef.current;
        if (!targetMesh) return prev;

        const vector = new THREE.Vector3();
        targetMesh.getWorldPosition(vector);
        vector.project(cameraRef.current);

        const x = (vector.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-vector.y * 0.5 + 0.5) * container.clientHeight;

        return { ...prev, x, y };
      });

      controls.update();
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate(0);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event: MouseEvent) => {
      if (!container || !cameraRef.current) return;

      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects([starMesh, planetMesh]);
      
      if (intersects.length > 0) {
        const target = intersects[0].object === planetMesh ? "planet" : "star";
        
        setLabel({
          visible: true,
          target,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });

        if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
        labelTimerRef.current = setTimeout(() => {
          setLabel(prev => ({ ...prev, visible: false }));
        }, 5000);
      } else {
        setLabel(prev => ({ ...prev, visible: false }));
      }
    };

    renderer.domElement.addEventListener("mousedown", handleMouseClick);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
      controls.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener("mousedown", handleMouseClick);
      starGeometry.dispose();
      starMaterial.dispose();
      starfieldGeometry.dispose();
      starfieldMaterial.dispose();
      planetGeometry.dispose();
      planetMaterial.dispose();
      planetTexture.dispose();
      renderer.dispose();
    };
  }, []); 

  useEffect(() => {
    const starProps = getStarProps(params.starTemp);
    const starColor = new THREE.Color(starProps.colorHex);
    const starGlowColor = new THREE.Color(starProps.glowHex);

    if (starMeshRef.current) {
      const scale = starProps.sizeMultiplier * 3.0;
      starMeshRef.current.scale.setScalar(scale);

      if (starTextureRef.current && starTextureRef.current.image) {
        const starCanvas = starTextureRef.current.image as HTMLCanvasElement;
        drawProceduralStarMap(starCanvas, params.starTemp);
        starTextureRef.current.needsUpdate = true;
      }

      if (starLightRef.current) {
        starLightRef.current.color.copy(starColor);
        starLightRef.current.intensity = 15.0 * scale;
      }
    }

    if (starGlowRef.current) {
      const glowMat = starGlowRef.current.material as THREE.SpriteMaterial;
      glowMat.color.copy(starGlowColor);
      const glowScale = starProps.sizeMultiplier * 3.0 * 2.8;
      starGlowRef.current.scale.set(glowScale, glowScale, 1.0);
    }

    const points: THREE.Vector3[] = [];
    const segments = 120;
    const orbitStarScale = starProps.sizeMultiplier * 3.0;
    const orbitalRadius = orbitStarScale + 1.5 + (params.orbitDistance * 8.0);
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * orbitalRadius, 0, Math.sin(theta) * orbitalRadius));
    }

    if (orbitLineRef.current) {
      orbitLineRef.current.geometry.setFromPoints(points);
    }

    if (planetMeshRef.current) {
      planetMeshRef.current.scale.setScalar(0.4 + params.planetRadius * 0.3);
      
      if (planetTextureRef.current && planetTextureRef.current.image) {
        const canvas = planetTextureRef.current.image as HTMLCanvasElement;
        drawProceduralPlanetMap(canvas, params.equilibriumTemp);
        planetTextureRef.current.needsUpdate = true;
      }

      const planetMat = planetMeshRef.current.material as THREE.MeshPhongMaterial;
      if (planetMat) {
        const tempIntensity = Math.max(0, (params.equilibriumTemp - 260) / 240); 
        planetMat.emissive = new THREE.Color(0xff4c14).multiplyScalar(tempIntensity * 0.45);
      }
    }
  }, [params]);

  return (
    <div key="cosmic-canvas" className="w-full h-full relative overflow-hidden bg-transparent">
      <div id="three-container" ref={containerRef} className="w-full h-full" />

      {label.visible && label.target && (
        <div 
          className="absolute z-50 pointer-events-none transition-all duration-75 ease-out"
          style={{ 
            left: `${label.x}px`, 
            top: `${label.y}px`,
            transform: "translate(-50%, -120%)" 
          }}
        >
          <div className="relative glass border border-white/10 p-4 rounded-lg shadow-2xl min-w-[200px] animate-in fade-in zoom-in duration-300">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-gradient-to-t from-white/20 to-transparent" />
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  {label.target === "planet" ? (
                    <Sparkles className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="text-[10px] font-mono font-bold tracking-widest text-white/90 uppercase">
                    {label.target === "planet" ? "Exoplanet Data" : "Host Star Data"}
                  </span>
                </div>
                <Info className="w-3 h-3 text-white/30" />
              </div>

              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-white/40 uppercase tracking-tighter">Classification</span>
                  <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                    {label.target === "planet" 
                      ? metrics.classification 
                      : (metrics.starClass.includes("(") ? metrics.starClass.split("(")[1].replace(")", "") : metrics.starClass)
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Thermometer className="w-2.5 h-2.5 text-orange-400" />
                      <span className="text-[8px] font-mono text-white/40 uppercase">Temp</span>
                    </div>
                    <span className="text-xs font-medium text-white">
                      {label.target === "planet" ? params.equilibriumTemp : params.starTemp} K
                    </span>
                  </div>
                  
                  {label.target === "planet" ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Weight className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-[8px] font-mono text-white/40 uppercase">Mass</span>
                      </div>
                      <span className="text-xs font-medium text-white">{params.planetMass} M⊕</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Zap className="w-2.5 h-2.5 text-sky-400" />
                        <span className="text-[8px] font-mono text-white/40 uppercase">Class</span>
                      </div>
                      <span className="text-xs font-medium text-white">
                        {metrics.starClass.split(" ")[1]}
                      </span>
                    </div>
                  )}
                </div>

                {label.target === "planet" && (
                  <div className="pt-2 mt-1 border-t border-white/5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Orbit className="w-2.5 h-2.5 text-indigo-400" />
                        <span className="text-[8px] font-mono text-white/40 uppercase">Orbital Period</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {metrics.orbitalPeriod}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}