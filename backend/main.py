import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.config import settings
from db.mongodb import connect_to_mongo, close_mongo_connection

from services.detection_service import detection_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    # LOAD YOLO ONCE AT STARTUP
    detection_service.load_model()
    # Ensure static directories exist
    os.makedirs("backend/static/videos", exist_ok=True)
    os.makedirs("backend/static/images", exist_ok=True)
    os.makedirs("backend/static/uploads", exist_ok=True)
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS — allow all configured origins + always allow localhost dev ports
cors_origins = list(settings.BACKEND_CORS_ORIGINS)
# Ensure common dev URLs are always included
for url in ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"]:
    if url not in cors_origins:
        cors_origins.append(url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (detection images, etc.)
if os.path.isdir("backend/static"):
    app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.get("/")
async def root():
    return {"message": "Welcome to Intelligent Poaching Detection API"}

from api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
