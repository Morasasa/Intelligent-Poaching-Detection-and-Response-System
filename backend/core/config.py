from typing import List, Union
from pydantic import validator
from pydantic_settings import BaseSettings

import os
from pathlib import Path

# Get the directory where config.py is located
current_dir = Path(__file__).resolve().parent
# Navigate up to the backend directory
env_path = current_dir.parent / ".env"

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Intelligent Poaching Detection System"
    
    # CORS - use plain strings to avoid AnyHttpUrl parsing issues with .env format
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str):
            # Handle both JSON-style ["http://..."] and comma-separated formats
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                pass
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    # Database
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "poaching_detection_db"

    # JWT
    JWT_SECRET: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    EMAIL_ADDRESS: str = ""
    EMAIL_APP_PASSWORD: str = ""
    OFFICER_EMAIL: str = ""
    EMAILS_FROM_EMAIL: str = "alerts@poachingdetection.com"
    EMAILS_FROM_NAME: str = "Poaching Detection Alert"

    class Config:
        case_sensitive = True
        env_file = str(env_path)
        env_file_encoding = 'utf-8'

settings = Settings()
