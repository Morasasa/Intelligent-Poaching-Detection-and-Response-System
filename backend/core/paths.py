from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BACKEND_DIR / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
IMAGES_DIR = STATIC_DIR / "images"
VIDEOS_DIR = STATIC_DIR / "videos"
MODELS_DIR = BACKEND_DIR / "models"


def ensure_static_directories() -> None:
    """Create runtime storage paths independently of the server working directory."""
    for directory in (UPLOADS_DIR, IMAGES_DIR, VIDEOS_DIR):
        directory.mkdir(parents=True, exist_ok=True)
