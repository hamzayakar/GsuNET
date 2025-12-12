"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "GSUNET API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://gsu_user:gsu_password@localhost:5432/gsunet_db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"  # Change in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        case_sensitive = True


settings = Settings()
