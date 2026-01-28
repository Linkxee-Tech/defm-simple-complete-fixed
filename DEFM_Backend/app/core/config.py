from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./defm.db",
        description="Database connection URL"
    )

    # Security
    SECRET_KEY: str = Field(
        default="defm-secret-key-change-in-production",
        description="Secret key for JWT token generation"
    )
    ALGORITHM: str = Field(
        default="HS256",
        description="JWT algorithm"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="Access token expiration time in minutes"
    )

    # File Storage
    UPLOAD_DIRECTORY: str = Field(
        default="./uploads",
        description="Directory for uploaded files"
    )
    MAX_FILE_SIZE: int = Field(
        default=100000000,
        description="Maximum file size in bytes (100MB)"
    )
    ALLOWED_FILE_TYPES: str = Field(
        default="pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,7z,log",
        description="Comma-separated list of allowed file extensions"
    )

    # Application
    APP_NAME: str = Field(
        default="Digital Evidence Framework Management",
        description="Application name"
    )
    APP_VERSION: str = Field(
        default="1.0.0",
        description="Application version"
    )
    DEBUG: bool = Field(
        default=True,
        description="Debug mode"
    )

    # CORS
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    # Email
    SMTP_HOST: str = Field(
        default="",
        description="SMTP server host"
    )
    SMTP_PORT: int = Field(
        default=587,
        description="SMTP server port"
    )
    SMTP_USERNAME: str = Field(
        default="",
        description="SMTP username"
    )
    SMTP_PASSWORD: str = Field(
        default="",
        description="SMTP password"
    )

    class Config:
        env_file = ".env"
        case_sensitive = False
        
    @property
    def allowed_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    @property
    def allowed_file_types_list(self) -> List[str]:
        """Get allowed file types as a list."""
        return [ext.strip() for ext in self.ALLOWED_FILE_TYPES.split(",")]


settings = Settings()
