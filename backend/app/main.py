from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.init_db import init_database

from app.api.routes import health, fires, regions, analytics, ingestion, infrastructure, evacuation

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: configure logging and ensure DB schema
    setup_logging()
    logger.info("Starting Fire Intelligence Backend...")
    import os
    if os.environ.get("TESTING") != "1":
        try:
            init_database()
            logger.info("Database initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize database during startup: {e}")
    yield
    # Shutdown
    logger.info("Shutting down Fire Intelligence Backend.")

app = FastAPI(
    title="Fire sync API",
    description="Geospatial wildfire intelligence system processing NASA FIRMS satellite observations, "
                "historical analytics, anomaly detection, resolution harmonization, and risk modeling.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(fires.router, prefix=settings.API_V1_PREFIX)
app.include_router(regions.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(ingestion.router, prefix=settings.API_V1_PREFIX)
app.include_router(infrastructure.router, prefix=settings.API_V1_PREFIX)
app.include_router(evacuation.router, prefix=settings.API_V1_PREFIX)

import os
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check for frontend build folder
_possible_dists = [
    Path(__file__).resolve().parent.parent.parent / "Recreate Dark Enterprise Dashboard" / "dist",
    Path(__file__).resolve().parent.parent.parent / "dist",
    Path(__file__).resolve().parent.parent / "dist",
]
_frontend_dist = next((p for p in _possible_dists if p.exists() and (p / "index.html").exists()), None)

if _frontend_dist:
    _assets_dir = _frontend_dist / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept api routes or docs
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        target_file = _frontend_dist / full_path
        if full_path and target_file.exists() and target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(_frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "project": "Fire sync Platform API",
            "version": "1.0.0",
            "docs": f"{settings.API_V1_PREFIX}/docs",
            "health": f"{settings.API_V1_PREFIX}/health"
        }
