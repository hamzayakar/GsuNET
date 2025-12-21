"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    """Application settings - loaded from .env file"""

    # Application
    APP_NAME: str = "GSUNET API"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # OpenAI API (Review6: AI-powered sponsor matching)
    OPENAI_API_KEY: str

    # CORS - will be parsed from comma-separated string in .env
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]


settings = Settings()
