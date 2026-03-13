from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://stayhub_user:stayhub_pass@db:5432/stayhub_db"
    SECRET_KEY: str = "stayhub-super-secret-key-2026-isaac-haro-torres"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720
    UPLOAD_DIR: str = "/app/uploads"

    class Config:
        env_file = ".env"

settings = Settings()
