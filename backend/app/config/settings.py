"""Application settings — Pydantic BaseSettings. Crashes on startup if required fields missing."""

from pathlib import Path
from typing import List, Union

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/app/config → backend


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_ENV: str = "development"
    PORT: int = 8000
    SECRET_KEY: str

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # AES-256 encryption for stored AI API keys
    ENCRYPTION_KEY: str

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000"
    CLIENT_URL: str = "http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"
    VERCEL_PROJECT_NAME: str = ""

    # Supabase Auth
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Supabase Storage
    STORAGE_BUCKET: str = "resume-uploads"

    # Uploaded file storage
    UPLOAD_DIR: str = "./uploads"

    # PDF export via Playwright
    PDF_EXPORT_TIMEOUT_MS: int = 30000

    # Observability (optional)
    SENTRY_DSN: str = ""


settings = Settings()
