from dataclasses import dataclass, field
from functools import lru_cache
import os


@dataclass
class Settings:
    app_name: str = "Bricks Maker Advertisement API"
    app_version: str = "1.0.0"
    environment: str = "development"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./bricks_maker.db"
    cors_origins: list[str] = field(default_factory=lambda: [
        "http://localhost:4001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ])
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60


@lru_cache
def get_settings() -> Settings:
    origins = os.getenv("CORS_ORIGINS")
    default_origins = [
        "http://localhost:4001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    return Settings(
        app_name=os.getenv("APP_NAME", "Bricks Maker Advertisement API"),
        app_version=os.getenv("APP_VERSION", "1.0.0"),
        environment=os.getenv("APP_ENV", "development"),
        api_prefix=os.getenv("API_PREFIX", "/api"),
        database_url=os.getenv("DATABASE_URL", "sqlite:///./bricks_maker.db"),
        cors_origins=[item.strip() for item in origins.split(",")] if origins else default_origins,
        secret_key=os.getenv("SECRET_KEY", "change-me-in-production"),
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")),
    )


settings = get_settings()
