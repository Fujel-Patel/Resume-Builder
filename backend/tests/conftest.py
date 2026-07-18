import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.config.database import get_db
from app.main import app
from app.utils.auth import get_current_user
from app.utils.cache import invalidate_user

USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


@pytest.fixture(autouse=True)
def _clear_cache():
    """Clear per-user cache before every test to prevent stale data."""
    invalidate_user(str(USER_ID))

# Suppress DB connection during tests
@asynccontextmanager
async def noop_lifespan(_app):
    yield

app.router.lifespan_context = noop_lifespan


def _set_server_defaults(obj):
    now = datetime.now(timezone.utc)
    if hasattr(obj, "created_at") and obj.created_at is None:
        obj.created_at = now
    if hasattr(obj, "updated_at") and obj.updated_at is None:
        obj.updated_at = now
    if hasattr(obj, "id") and obj.id is None:
        obj.id = uuid.uuid4()


def mock_result(scalar_value=None, scalars_all=None):
    result = MagicMock()
    scalars = MagicMock()
    scalars.first.return_value = scalar_value
    scalars.all.return_value = scalars_all if scalars_all is not None else []
    result.scalars.return_value = scalars
    return result


def make_provider_mock(**kwargs):
    p = MagicMock()
    p.id = kwargs.get("id", uuid.uuid4())
    p.user_id = kwargs.get("user_id", USER_ID)
    p.provider_name = kwargs.get("provider_name", "gemini")
    p.base_url = kwargs.get("base_url", None)
    p.model = kwargs.get("model", None)
    p.is_default = kwargs.get("is_default", False)
    p.is_verified = kwargs.get("is_verified", False)
    p.api_key_encrypted = kwargs.get("api_key_encrypted", "encrypted:abc123")
    return p


def make_scan_mock(**kwargs):
    s = MagicMock()
    s.id = kwargs.get("id", uuid.uuid4())
    s.user_id = kwargs.get("user_id", USER_ID)
    s.resume_id = kwargs.get("resume_id", None)
    s.overall_score = kwargs.get("overall_score", 85)
    s.score_report = kwargs.get("score_report", {
        "overall_score": 85,
        "section_scores": {"format": 90, "keywords": 80, "readability": 85, "completeness": 85},
        "missing_keywords": ["AWS"],
        "suggestions": ["Add AWS experience"],
    })
    s.job_description = kwargs.get("job_description", None)
    s.created_at = kwargs.get("created_at", datetime.now(timezone.utc))
    return s


@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = USER_ID
    user.is_active = True
    user.name = "Test User"
    user.email = "test@example.com"
    return user


@pytest.fixture
def mock_db():
    db = MagicMock()
    db.execute = AsyncMock(return_value=mock_result())
    db.add = MagicMock()
    db.flush = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock(side_effect=_set_server_defaults)
    db.delete = AsyncMock()
    return db


@pytest.fixture
def client(mock_user, mock_db):
    async def override_get_db():
        return mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: mock_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
