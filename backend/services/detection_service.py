import os
import cv2
import uuid
import torch
from typing import List, Dict, Any
from datetime import datetime
from ultralytics import YOLO

from db.mongodb import get_database
from schemas.detection import DetectionCreate
from schemas.alert import AlertCreate, AlertStatus
from core.paths import IMAGES_DIR, MODELS_DIR
from services.email_service import EmailService

class DetectionService:
    def __init__(self):
        self.model = None
        self.model_path = str(MODELS_DIR / "best.pt")
        self.email_service = EmailService()
        self.critical_classes = ["poacher", "weapon"]

    def _load_yolo_with_compat(self, weights_path: str):
        """Force legacy torch.load behavior for trusted YOLO checkpoints."""
        original_torch_load = torch.load

        def compatible_torch_load(*args, **kwargs):
            kwargs.setdefault("weights_only", False)
            return original_torch_load(*args, **kwargs)

        torch.load = compatible_torch_load
        try:
            return YOLO(weights_path)
        finally:
            torch.load = original_torch_load

    def load_model(self):
        """Loads the YOLOv8 model into memory. Called once during FastAPI lifespan startup."""
        print(f"Loading YOLO model from {self.model_path}...")
        try:
            # Check if model exists, if not use a pretrained base model as fallback for dev
            if not os.path.exists(self.model_path):
                print(f"Warning: Model not found at {self.model_path}, using default yolov8n.pt")
                self.model = self._load_yolo_with_compat("yolov8n.pt")
            else:
                self.model = self._load_yolo_with_compat(self.model_path)
            print("YOLO model loaded successfully.")
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            self.model = None

    async def process_video(self, video_id: str, file_path: str) -> List[Dict[str, Any]]:
        """
        Process a video or image file, run YOLO inference, save results to DB, and trigger alerts.
        """
        if not self.model:
            raise RuntimeError("YOLO model is not loaded.")

        db = get_database()
        
        # 0. Set status to processing
        await db.videos.update_one(
            {"_id": video_id},
            {"$set": {"status": "processing"}}
        )

        try:
            results = self.model(file_path) # Run inference
        except Exception as e:
            print(f"Error during YOLO inference: {e}")
            await db.videos.update_one(
                {"_id": video_id},
                {"$set": {"status": "failed"}}
            )
            return {"detections": [], "alerts": []}

        detections = []
        alerts_generated = []

        is_video = file_path.lower().endswith((".mp4", ".avi", ".mov"))
        
        for batch_idx, r in enumerate(results):
            boxes = r.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = r.names[class_id].lower()
                
                mapping = {
                    "person": "poacher", "hunter": "poacher", "poacher": "poacher",
                    "gun": "weapon", "rifle": "weapon", "pistol": "weapon", "weapon": "weapon", "knife": "weapon",
                    "ranger": "ranger", "guard": "ranger", "truck": "ranger", "car": "ranger", "vehicle": "ranger",
                    "animal": "animal", "elephant": "animal", "tiger": "animal", "lion": "animal", "rhino": "animal",
                    "bear": "animal", "zebra": "animal", "giraffe": "animal", "bird": "animal", "horse": "animal",
                    "cow": "animal", "sheep": "animal", "dog": "animal", "cat": "animal"
                }
                
                mapped_class = mapping.get(class_name)
                if not mapped_class:
                    continue
                    
                class_name = mapped_class

                if confidence < 0.3:
                    continue

                frame_filename = f"{uuid.uuid4()}_frame.jpg"
                frame_path = IMAGES_DIR / frame_filename

                img = r.plot()
                cv2.imwrite(str(frame_path), img)

                detection_data = DetectionCreate(
                    video_id=video_id,
                    object_type=class_name,
                    confidence_score=confidence,
                    timestamp_in_video=0.0 if not is_video else float(batch_idx) / 30.0,
                    frame_image_path=f"/static/images/{frame_filename}"
                )
                
                det_dict = detection_data.model_dump()
                det_dict["detection_id"] = str(uuid.uuid4())

                insert_result = await db.detections.insert_one(det_dict)
                saved_detection = {
                    **det_dict,
                    "_id": str(insert_result.inserted_id),
                }
                detections.append(saved_detection)

                if class_name.lower() in self.critical_classes:
                    print(f"Critical threat detected: {class_name} ({confidence:.2f})")
                    alert_data = AlertCreate(
                        detection_id=saved_detection["detection_id"],
                        alert_type=class_name.lower(),
                        officer_email=self.email_service.officer_email,
                        status=AlertStatus.sent
                    )
                    alert_dict = alert_data.model_dump()
                    alert_dict["alert_id"] = str(uuid.uuid4())
                    
                    alert_insert_result = await db.alerts.insert_one(alert_dict)
                    alerts_generated.append(
                        {
                            **alert_dict,
                            "_id": str(alert_insert_result.inserted_id),
                        }
                    )
                    
                    self.email_service.send_alert_email_background(
                        alert_type=class_name,
                        confidence=confidence,
                        image_path=str(frame_path)
                    )
                    
        await db.videos.update_one(
            {"_id": video_id},
            {"$set": {"status": "completed"}}
        )
        
        return {
            "detections": detections,
            "alerts": alerts_generated
        }

# Global singleton instance
detection_service = DetectionService()
