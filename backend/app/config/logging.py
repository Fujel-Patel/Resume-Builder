"""Centralized loguru configuration.

Call ``setup_logging()`` once at app startup (in ``main.py`` lifespan).
All modules then ``from loguru import logger`` — no per-file setup needed.
"""

import sys

from loguru import logger

_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> — "
    "<level>{message}</level>"
)


def setup_logging(*, debug: bool = False) -> None:
    """Configure loguru: drop default sink, add console, silence noisy libraries."""
    logger.remove()  # remove the default stderr handler

    level = "DEBUG" if debug else "INFO"

    logger.add(
        sys.stderr,
        level=level,
        format=_FORMAT,
        colorize=True,
        backtrace=True,
        diagnose=False,
    )

    # Silence chatty third-party loggers
    for name in ("uvicorn", "uvicorn.access", "uvicorn.error", "slowapi", "sqlalchemy.engine"):
        logger.disable(name)
