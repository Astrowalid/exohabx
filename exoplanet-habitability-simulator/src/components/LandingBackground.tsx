import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getStarProps } from "../utils";

export default function LandingBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x111122, 0.5);
    scene.add(hemisphereLight);

    const solarSystem = new THREE.Group();
    scene.add(solarSystem);
    solarSystem.position.y = 4; 

    const starProps = getStarProps(5778); 
    const starGeometry = new THREE.SphereGeometry(4, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({ color: starProps.colorHex });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    solarSystem.add(starMesh);

    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 256; glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext("2d");
    if (glowCtx) {
      const grad = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      grad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
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
      opacity: 0.8,
    });
    const starGlow = new THREE.Sprite(starGlowMaterial);
    starGlow.scale.set(15, 15, 1);
    solarSystem.add(starGlow);

    const planetGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({ color: 0x38bdf8, shininess: 10 });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    solarSystem.add(planetMesh);

    const points: THREE.Vector3[] = [];
    const orbitSegments = 256; 
    for (let i = 0; i <= orbitSegments; i++) {
      const theta = (i / orbitSegments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * 15, 0, Math.sin(theta) * 15));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ 
      color: 0x38bdf8, 
      transparent: true, 
      opacity: 0.5, 
      blending: THREE.AdditiveBlending
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitLine.rotation.x = Math.PI * 0.1;
    solarSystem.add(orbitLine);

    const starfieldGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 50 + Math.random() * 50;
      const u = Math.random(); const v = Math.random();
      const theta = u * 2 * Math.PI; const phi = Math.acos(2 * v - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starfieldGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starfieldMaterial = new THREE.PointsMaterial({ 
      size: 0.25, 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.9,
      blending: THREE.AdditiveBlending 
    });
    const starfield = new THREE.Points(starfieldGeometry, starfieldMaterial);
    scene.add(starfield);

    const pointLight = new THREE.PointLight(starProps.colorHex, 10, 50);
    solarSystem.add(pointLight);

    let angle = 0;
    let animationFrameId: number;
    const animate = () => {
      angle += 0.002;
      planetMesh.position.set(Math.cos(angle) * 15, 0, Math.sin(angle) * 15);
      planetMesh.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 0.1);
      
      starMesh.rotation.y += 0.001;
      starfield.rotation.y += 0.0005;
      starfield.rotation.z += 0.0002;
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      starGeometry.dispose();
      starMaterial.dispose();
      planetGeometry.dispose();
      planetMaterial.dispose();
      orbitGeometry.dispose();
      orbitMaterial.dispose();
      starfieldGeometry.dispose();
      starfieldMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none opacity-80" />;
}