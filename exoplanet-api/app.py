import os
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import joblib
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

CORS(app) 

try:
    model = joblib.load('ai_astrobiologist_model.pkl')
    logger.info("Model loaded successfully!")
except Exception as e:
    logger.error(f"Critical Error: Could not load model: {e}")

@app.route('/predict', methods=['POST'])
@limiter.limit("5 per minute") 
def predict_esi():
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        features = [
            float(data.get('radius', 1.0)),
            float(data.get('mass', 1.0)),
            float(data.get('temp', 255.0)),
            float(data.get('orbit', 1.0)),
            float(data.get('eccentricity', 0.0)),
            float(data.get('star_temp', 5778.0)),
            float(data.get('num_stars', 1.0))
        ]
        
        features_array = np.array(features).reshape(1, -1)
        prediction = model.predict(features_array)
        
        return jsonify({
            'success': True,
            'esi_score': float(prediction[0])
        })
        
    except (ValueError, TypeError) as e:
        return jsonify({'success': False, 'error': 'Invalid input values'}), 400
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'success': False, 'error': 'An internal processing error occurred'}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)