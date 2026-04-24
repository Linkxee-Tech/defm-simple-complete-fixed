import sys
from pathlib import Path

from fastapi import FastAPI, Response, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.core.lifespan import lifespan

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def resolve_frontend_dist() -> Path:
    """
    Resolve frontend dist folder for both source-run and PyInstaller-run modes.
    """
    if getattr(sys, "frozen", False):
        base_dir = Path(getattr(sys, "_MEIPASS", Path.cwd()))
        return base_dir / "DEFM_Frontend" / "dist"
    return Path(__file__).resolve().parents[1] / "DEFM_Frontend" / "dist"


frontend_dist = resolve_frontend_dist()

app = FastAPI(
    title="DEFM Desktop API",
    version=settings.APP_VERSION,
    description="DEFM desktop bundle",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    from datetime import datetime

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": settings.APP_VERSION,
        "mode": "desktop",
    }


@app.exception_handler(404)
async def not_found_handler(request, exc):
    if str(request.url.path).startswith("/api/"):
        return JSONResponse(status_code=404, content={"detail": "Endpoint not found"})
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error on %s: %s", request.url.path, exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(frontend_dist / "index.html")

    @app.get("/favicon.ico")
    async def serve_favicon():
        candidates = [
            frontend_dist / "favicon.ico",
            frontend_dist / "assets" / "favicon.ico",
        ]
        for icon_path in candidates:
            if icon_path.exists() and icon_path.is_file():
                return FileResponse(icon_path)
        return Response(status_code=204)

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str, request: Request = None):
        if full_path.startswith("api/") or full_path in {"docs", "redoc", "openapi.json"}:
            if request and not request.url.path.endswith("/"):
                # Missing trailing slash intercepted by catch-all; redirect to allow API routing
                new_url = str(request.url.replace(path=request.url.path + "/"))
                from fastapi.responses import RedirectResponse
                return RedirectResponse(url=new_url, status_code=307)
            return JSONResponse(status_code=404, content={"detail": "Not found"})

        try:
            target = (frontend_dist / full_path).resolve()
            if not target.is_relative_to(frontend_dist.resolve()):
                return JSONResponse(status_code=403, content={"detail": "Access denied"})
        except Exception:
            return JSONResponse(status_code=403, content={"detail": "Invalid path"})

        if target.exists() and target.is_file():
            return FileResponse(target)
        return FileResponse(frontend_dist / "index.html")
else:
    logger.warning("Frontend dist not found at %s. UI will not be served.", frontend_dist)
