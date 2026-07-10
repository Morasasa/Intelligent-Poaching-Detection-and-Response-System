import cv2
import torch
from ultralytics import YOLO
import os
from datetime import datetime
from pathlib import Path

# Monkey-patch torch.load to bypass PyTorch 2.6+ weights_only=True default
# Ultralytics natively requires weights_only=False to load its model architectures
_original_torch_load = torch.load

def _patched_torch_load(*args, **kwargs):
    kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)

torch.load = _patched_torch_load

# Resolve model path relative to project root (not cwd)
PROJECT_ROOT = Path(__file__).resolve().parent.parent

def _resolve_model_path(model_path: str) -> str:
    """
    Find the model file. Search order:
    1. Exact path as given (absolute or relative to cwd)
    2. model/ directory
    3. Project root directory
    4. Fall back to yolov8n.pt (YOLO auto-downloads if missing)
    """
    # Check as-is
    if os.path.isfile(model_path):
        return model_path
    
    # Check in model/ directory
    in_model_dir = PROJECT_ROOT / "model" / model_path
    if in_model_dir.is_file():
        return str(in_model_dir)
    
    # Check in project root
    in_root = PROJECT_ROOT / model_path
    if in_root.is_file():
        return str(in_root)
    
    # Fallback
    fallback = PROJECT_ROOT / "yolov8n.pt"
    if fallback.is_file():
        print(f"Model '{model_path}' not found, falling back to {fallback}")
        return str(fallback)
    
    # Let YOLO handle it (will download yolov8n.pt automatically)
    print(f"Model '{model_path}' not found, YOLO will attempt auto-download")
    return model_path


class PoachingDetector:
    def __init__(self, model_path="best.pt"):
        resolved = _resolve_model_path(model_path)
        print(f"Loading detection model: {resolved}")
        self.model = YOLO(resolved)
        
        # COCO class mapping (used when running standard yolov8n, not custom trained)
        # Custom best.pt should have its own class names automatically
        # 0: person → poacher (demo mapping)
        # 14-23: animals (bird, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe)
        self.target_classes = [0, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
        
        # Check if this is a custom model by inspecting class names
        model_names = list(self.model.names.values())
        self.is_custom_model = 'poacher' in model_names or 'weapon' in model_names
        if self.is_custom_model:
            print(f"Custom model detected. Classes: {model_names}")
        else:
            print(f"Using standard COCO model with class mapping. Classes: {len(model_names)}")

    def classify_detection(self, class_id: int, label: str) -> str:
        """Map model class to application detection type."""
        if self.is_custom_model:
            # Custom model: use labels directly
            return label
        
        # Standard COCO model: apply demo mapping
        if label == 'person':
            return 'poacher'
        elif class_id in list(range(14, 24)):
            return 'animal'
        elif label in ['knife', 'scissors']:
            return 'weapon'
        return None

    def process_video(self, video_path: str, output_path: str = None, callback=None):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error opening video file: {video_path}")
            return

        frame_count = 0
        
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            frame_count += 1
            
            # Run YOLOv8 inference on the frame
            results = self.model(frame, verbose=False)

            # Process detections
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    c = int(box.cls)
                    conf = float(box.conf)
                    label = self.model.names[c]
                    
                    detected_class = self.classify_detection(c, label)
                    
                    if detected_class:
                        detection = {
                            "timestamp": datetime.now(),
                            "class": detected_class,
                            "confidence": conf,
                            "frame": frame
                        }
                        
                        if callback:
                            callback(detection)

        cap.release()
