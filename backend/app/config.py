import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VeriMed API"
    API_V1_STR: str = "/api/v1"
    
    # DB settings (fallback to sqlite if not defined or fallback requested)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///C:/Users/agarw/.gemini/antigravity/scratch/verimed/backend/verimed.db"
    )
    
    # Redis settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # App configs
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-verimed-key-change-in-prod")
    
    # CV thresholds
    CV_LOGO_THRESHOLD: float = 0.05       # 5% max allowed deviation
    CV_TYPO_THRESHOLD: float = 0.03       # 3% max allowed deviation
    CV_COLOR_THRESHOLD: float = 0.07      # 7% max allowed deviation

    class Config:
        case_sensitive = True

# Install pydantic-settings in backend
settings = Settings()
