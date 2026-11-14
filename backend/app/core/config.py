import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_default_db_file = os.path.join(_backend_dir, "fire_intelligence.db").replace("\\", "/")

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(_backend_dir, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    PROJECT_NAME: str = "Fire Intelligence Platform"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "fire_intelligence"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    DATABASE_URL: str = f"sqlite:///{_default_db_file}"
    ASYNC_DATABASE_URL: str = f"sqlite+aiosqlite:///{_default_db_file}"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:8443",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8443",
        "http://127.0.0.1:3000",
    ]

    # Data ingestion paths
    DATASET_BRAZIL_PATH: str = "../brazil"
    DATASET_CANADA_PATH: str = "../canada"

    # Analytics Cache & Parquet
    DUCKDB_PATH: str = "./data/analytics.duckdb"
    PARQUET_STORE_PATH: str = "./data/parquet"

    # External APIs
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1/forecast"


settings = Settings()
