"""
Redis connection and ARQ pool configuration
"""
from arq import create_pool
from arq.connections import RedisSettings, ArqRedis
from typing import Optional

from .config import settings


# Redis settings for ARQ
def get_redis_settings() -> RedisSettings:
    """Get Redis settings from config"""
    # Parse Redis URL: redis://localhost:6379
    # ARQ expects host and port separately
    redis_url = settings.REDIS_URL

    # Simple URL parsing (assumes redis://host:port format)
    if redis_url.startswith("redis://"):
        redis_url = redis_url.replace("redis://", "")

    host, port = redis_url.split(":") if ":" in redis_url else (redis_url, "6379")

    return RedisSettings(
        host=host,
        port=int(port),
        database=0
    )


# Global ARQ pool instance
_redis_pool: Optional[ArqRedis] = None


async def get_redis_pool() -> ArqRedis:
    """
    Get or create Redis pool for ARQ
    Used for enqueueing tasks
    """
    global _redis_pool

    if _redis_pool is None:
        _redis_pool = await create_pool(get_redis_settings())

    return _redis_pool


async def close_redis_pool():
    """Close Redis pool on shutdown"""
    global _redis_pool

    if _redis_pool is not None:
        await _redis_pool.close()
        _redis_pool = None
