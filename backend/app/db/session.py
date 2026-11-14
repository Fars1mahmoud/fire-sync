import os
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from app.core.config import settings
from app.core.logging import logger

class Base(DeclarativeBase):
    pass

# Production-ready connection pooling with SQLite / PostgreSQL support
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///./") or db_url == "sqlite:///fire_intelligence.db":
    backend_root = Path(__file__).resolve().parent.parent.parent
    db_file_name = db_url.split("/")[-1]
    db_file_path = (backend_root / db_file_name).resolve().as_posix()
    db_url = f"sqlite:///{db_file_path}"

is_sqlite = "sqlite" in db_url.lower()
if is_sqlite:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=15,
        max_overflow=25,
        connect_args={"connect_timeout": 10} if "postgresql" in db_url else {}
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

def get_db() -> Generator[Session, None, None]:
    """Dependency injection yield for FastAPI request lifecycle"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
