from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db import engine, Base
from app.seed.seed_data import seed_data, AsyncSessionLocal
from app.routers import verify_image, verify_qr, anomalies, offline_sync, alerts_news

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables and seed if using SQLite or if tables do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        await seed_data(session)
        
    yield
    # Shutdown: Clean up connections
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the VeriMed Counterfeit Medicine Intelligence Ecosystem.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for React Native / web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Aggregate V1 API Routers
v1_router = APIRouter(prefix=settings.API_V1_STR)
v1_router.include_router(verify_image.router)
v1_router.include_router(verify_qr.router)
v1_router.include_router(anomalies.router)
v1_router.include_router(offline_sync.router)
v1_router.include_router(alerts_news.router)

app.include_router(v1_router)

@app.get("/")
def read_root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs"
    }
