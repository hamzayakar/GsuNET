"""
Main FastAPI application
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.core.redis import get_redis_pool, close_redis_pool
from app.routes import auth, events, rooms, clubs, registrations, notifications, users, club_join_requests, schedule, sponsorships

logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(rooms.router, prefix=settings.API_V1_STR)
app.include_router(clubs.router, prefix=settings.API_V1_STR)
app.include_router(clubs.user_clubs_router, prefix=settings.API_V1_STR)
app.include_router(registrations.router, prefix=settings.API_V1_STR)
app.include_router(registrations.user_router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(club_join_requests.router, prefix=settings.API_V1_STR)
app.include_router(schedule.router, prefix=settings.API_V1_STR)
app.include_router(sponsorships.router)  # Review6: Sponsor matching system


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize Redis pool on startup"""
    try:
        await get_redis_pool()
        logger.info("✅ Redis pool initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️  Redis pool initialization failed: {e}")
        logger.warning("   Background tasks will not work, but API will continue")


@app.on_event("shutdown")
async def shutdown_event():
    """Close Redis pool on shutdown"""
    try:
        await close_redis_pool()
        logger.info("✅ Redis pool closed successfully")
    except Exception as e:
        logger.error(f"❌ Error closing Redis pool: {e}")


@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Welcome to GSUNET API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    Checks database and Redis connectivity
    """
    health_status = {
        "status": "healthy",
        "database": "unknown",
        "redis": "unknown"
    }

    # Check database
    try:
        from app.core.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"

    # Check Redis
    try:
        redis = await get_redis_pool()
        await redis.ping()
        health_status["redis"] = "connected"
    except Exception as e:
        health_status["redis"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
        logger.warning(f"Redis health check failed: {e}")

    return health_status
