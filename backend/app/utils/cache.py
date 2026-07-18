"""In-memory TTL cache for hot-path API responses.

Usage:
    from app.utils.cache import user_get_or_set

    data = await user_get_or_set(user_id, "dashboard", _load_dashboard)
"""

import asyncio
from typing import Any, Callable, Optional

from cachetools import TTLCache

_user_caches: dict[str, TTLCache] = {}
global_cache = TTLCache(maxsize=64, ttl=300)

USER_CACHE_TTL = 60
USER_CACHE_MAXSIZE = 256


def _get_user_cache(user_id: str) -> TTLCache:
    if user_id not in _user_caches:
        _user_caches[user_id] = TTLCache(maxsize=USER_CACHE_MAXSIZE, ttl=USER_CACHE_TTL)
    return _user_caches[user_id]


async def get_or_set(
    cache: TTLCache,
    key: str,
    loader: Callable,
) -> Any:
    if key in cache:
        return cache[key]
    result = loader()
    if asyncio.iscoroutine(result):
        result = await result
    cache[key] = result
    return result


async def user_get_or_set(
    user_id: str,
    key: str,
    loader: Callable,
) -> Any:
    cache = _get_user_cache(user_id)
    return await get_or_set(cache, key, loader)


def invalidate_user(user_id: str, key: Optional[str] = None) -> None:
    cache = _user_caches.get(user_id)
    if cache is None:
        return
    if key:
        cache.pop(key, None)
    else:
        cache.clear()
        del _user_caches[user_id]


def invalidate_global(key: str) -> None:
    global_cache.pop(key, None)
