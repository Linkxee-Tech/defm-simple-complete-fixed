import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List
load_dotenv()


class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./defm.db")

    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "defm-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # File Storage
    UPLOAD_DIRECTORY: str = os.getenv("UPLOAD_DIRECTORY", "./uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "100000000"))  # 100MB
    ALLOWED_FILE_TYPES: list = os.getenv(
        "ALLOWED_FILE_TYPES", "pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,7z,log").split(",")

    # Application
    APP_NAME: str = os.getenv(
        "DEFM API", "Digital Evidence Framework Management")
    APP_VERSION: str = os.getenv("1.0.0", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # CORS
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

    # Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")


settings = Settings()
