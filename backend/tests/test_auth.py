"""Tests for auth.py — Supabase JWT validation and email_verified enforcement."""

import uuid
from unittest.mock import MagicMock, patch

import jwt as pyjwt
import pytest
from fastapi import HTTPException

from app.utils.auth import (
    _decode_supabase_token,
    _check_email_verified,
    _is_email_verified,
    _extract_display_name,
)


# ── Helper: build a fake Supabase JWT payload ────────────────────

def _make_payload(
    *,
    sub: str | None = str(uuid.uuid4()),
    email: str = "test@example.com",
    email_verified: bool = True,
    aud: str = "authenticated",
    exp: int = 9999999999,
) -> dict:
    return {
        "sub": sub,
        "email": email,
        "email_verified": email_verified,
        "aud": aud,
        "exp": exp,
        "iat": 1700000000,
        "role": "authenticated",
    }


# ── Tests: _check_email_verified ─────────────────────────────────


class TestCheckEmailVerified:
    def test_verified_passes(self):
        """email_verified=True should NOT raise."""
        payload = _make_payload(email_verified=True)
        _check_email_verified(payload)  # no exception

    def test_unverified_raises_403(self):
        """email_verified=False should raise 403."""
        payload = _make_payload(email_verified=False)
        with pytest.raises(HTTPException) as exc_info:
            _check_email_verified(payload)
        assert exc_info.value.status_code == 403
        assert exc_info.value.detail["code"] == "EMAIL_NOT_VERIFIED"

    def test_missing_claim_raises_403(self):
        """Missing email_verified key should raise 403 (falsy get returns None)."""
        payload = {"sub": "abc", "email": "a@b.com"}
        with pytest.raises(HTTPException) as exc_info:
            _check_email_verified(payload)
        assert exc_info.value.status_code == 403

    def test_none_claim_raises_403(self):
        """email_verified=None should raise 403."""
        payload = _make_payload()
        payload["email_verified"] = None
        with pytest.raises(HTTPException) as exc_info:
            _check_email_verified(payload)
        assert exc_info.value.status_code == 403


# ── Tests: _decode_supabase_token ────────────────────────────────


class TestDecodeSupabaseToken:
    def test_none_token_returns_none(self):
        """Empty string should return None (not crash)."""
        assert _decode_supabase_token("") is None

    def test_garbage_token_returns_none(self):
        """Random string should return None."""
        assert _decode_supabase_token("not.a.jwt") is None

    @patch("app.utils.auth._decode_with_secret", return_value=None)
    @patch("app.utils.auth._decode_with_jwks")
    def test_valid_token_decoded_via_jwks(self, mock_jwks_decode, _mock_secret):
        """JWKS path returns the payload when verification succeeds."""
        payload = _make_payload(sub=str(uuid.uuid4()))
        mock_jwks_decode.return_value = payload

        result = _decode_supabase_token("fake.jwt.token")
        assert result is not None
        assert result["email"] == "test@example.com"
        mock_jwks_decode.assert_called_once_with("fake.jwt.token")

    @patch("app.utils.auth.settings")
    @patch("app.utils.auth._decode_with_jwks", return_value=None)
    def test_valid_token_decoded_via_hs256_secret(self, _mock_jwks, mock_settings):
        """Legacy HS256 secret is used when JWKS fails."""
        secret = "test-secret-key-for-testing-purposes!!"
        mock_settings.SUPABASE_JWT_SECRET = secret
        payload = _make_payload(sub=str(uuid.uuid4()))
        token = pyjwt.encode(payload, secret, algorithm="HS256")

        result = _decode_supabase_token(token)
        assert result is not None
        assert result["email"] == "test@example.com"

    @patch("app.utils.auth.settings")
    @patch("app.utils.auth._decode_with_jwks", return_value=None)
    def test_wrong_key_returns_none(self, _mock_jwks, mock_settings):
        """Token signed with different key should return None."""
        mock_settings.SUPABASE_JWT_SECRET = "completely-different-key-32chars!!"
        payload = _make_payload()
        token = pyjwt.encode(payload, "wrong-key-also-long-enough-32ch!", algorithm="HS256")

        result = _decode_supabase_token(token)
        assert result is None

    @patch("app.utils.auth.settings")
    @patch("app.utils.auth._decode_with_jwks", return_value=None)
    def test_expired_token_returns_none(self, _mock_jwks, mock_settings):
        """Token with exp in the past should return None."""
        secret = "test-secret-key-for-testing-purposes!!"
        mock_settings.SUPABASE_JWT_SECRET = secret
        payload = _make_payload(exp=1)  # long expired
        token = pyjwt.encode(payload, secret, algorithm="HS256")

        result = _decode_supabase_token(token)
        assert result is None

    @patch("app.utils.auth.settings")
    @patch("app.utils.auth._decode_with_jwks", return_value=None)
    def test_wrong_audience_returns_none(self, _mock_jwks, mock_settings):
        """Token with wrong audience should return None."""
        secret = "test-secret-key-for-testing-purposes!!"
        mock_settings.SUPABASE_JWT_SECRET = secret
        payload = _make_payload(aud="wrong-audience")
        token = pyjwt.encode(payload, secret, algorithm="HS256")

        result = _decode_supabase_token(token)
        assert result is None


# ── Tests: get_current_user (unit-level, async) ──────────────────


class TestGetCurrentUser:
    """Test the real get_current_user dependency directly (not through TestClient)."""

    @pytest.mark.asyncio
    @patch("app.utils.auth.user_service")
    @patch("app.utils.auth._decode_supabase_token")
    async def test_verified_user_returns_user(self, mock_decode, mock_svc):
        """email_verified=True should pass and return the user profile."""
        from app.utils.auth import get_current_user
        from fastapi.security import HTTPAuthorizationCredentials
        from unittest.mock import AsyncMock

        user_id = uuid.uuid4()
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_svc.get_user_by_id = AsyncMock(return_value=mock_user)

        mock_decode.return_value = {
            "sub": str(user_id),
            "email": "test@example.com",
            "email_verified": True,
        }
        db = MagicMock()
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="fake-token")

        result = await get_current_user(credentials=creds, db=db)
        assert result.id == user_id

    @pytest.mark.asyncio
    @patch("app.utils.auth._decode_supabase_token")
    async def test_unverified_user_raises_403(self, mock_decode):
        """email_verified=False should raise 403."""
        from app.utils.auth import get_current_user
        from fastapi.security import HTTPAuthorizationCredentials

        mock_decode.return_value = {
            "sub": str(uuid.uuid4()),
            "email": "unverified@example.com",
            "email_verified": False,
        }
        db = MagicMock()
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="fake-token")

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds, db=db)
        assert exc_info.value.status_code == 403
        assert exc_info.value.detail["code"] == "EMAIL_NOT_VERIFIED"

    @pytest.mark.asyncio
    async def test_no_credentials_raises_401(self):
        """No credentials should raise 401."""
        from app.utils.auth import get_current_user

        db = MagicMock()
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=None, db=db)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    @patch("app.utils.auth._decode_supabase_token")
    async def test_invalid_token_raises_401(self, mock_decode):
        """Bad JWT should raise 401."""
        from app.utils.auth import get_current_user
        from fastapi.security import HTTPAuthorizationCredentials

        mock_decode.return_value = None
        db = MagicMock()
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="bad-token")

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds, db=db)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    @patch("app.utils.auth._decode_supabase_token")
    async def test_missing_sub_raises_401(self, mock_decode):
        """JWT without 'sub' claim should raise 401."""
        from app.utils.auth import get_current_user
        from fastapi.security import HTTPAuthorizationCredentials

        mock_decode.return_value = {"email": "a@b.com", "email_verified": True}
        db = MagicMock()
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="fake-token")

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds, db=db)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    @patch("app.utils.auth.user_service")
    @patch("app.utils.auth._decode_supabase_token")
    async def test_user_not_in_db_auto_creates_profile(self, mock_decode, mock_svc):
        """Valid JWT but user not in profiles table should auto-create profile."""
        from app.utils.auth import get_current_user
        from fastapi.security import HTTPAuthorizationCredentials
        from unittest.mock import AsyncMock, MagicMock

        user_id = uuid.uuid4()
        mock_decode.return_value = {
            "sub": str(user_id),
            "email": "ghost@example.com",
            "email_verified": True,
            # Access tokens expose user_metadata (not raw_user_meta_data)
            "user_metadata": {"name": "Ghost User"},
        }
        mock_user = MagicMock()
        mock_svc.get_user_by_id = AsyncMock(return_value=None)
        mock_svc.create_user = AsyncMock(return_value=mock_user)
        db = MagicMock()
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="fake-token")

        result = await get_current_user(credentials=creds, db=db)
        assert result == mock_user
        mock_svc.create_user.assert_awaited_once_with(
            db, user_id, "Ghost User", "ghost@example.com"
        )

    @pytest.mark.asyncio
    @patch("app.utils.auth.user_service")
    @patch("app.utils.auth._decode_supabase_token")
    async def test_legacy_raw_user_meta_data_still_works(self, mock_decode, mock_svc):
        """Fallback to raw_user_meta_data when user_metadata is absent."""
        from app.utils.auth import get_current_user
        from fastapi.security import HTTPAuthorizationCredentials
        from unittest.mock import AsyncMock, MagicMock

        user_id = uuid.uuid4()
        mock_decode.return_value = {
            "sub": str(user_id),
            "email": "legacy@example.com",
            "email_verified": True,
            "raw_user_meta_data": {"name": "Legacy User"},
        }
        mock_user = MagicMock()
        mock_svc.get_user_by_id = AsyncMock(return_value=None)
        mock_svc.create_user = AsyncMock(return_value=mock_user)
        db = MagicMock()
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="fake-token")

        await get_current_user(credentials=creds, db=db)
        mock_svc.create_user.assert_awaited_once_with(
            db, user_id, "Legacy User", "legacy@example.com"
        )


# ── Tests: edge cases ────────────────────────────────────────────


class TestEdgeCases:
    def test_check_email_verified_with_string_truthy(self):
        """email_verified='true' (string) should NOT raise."""
        payload = _make_payload()
        payload["email_verified"] = "true"
        _check_email_verified(payload)

    def test_check_email_verified_with_empty_string(self):
        """email_verified='' (empty string) should raise — falsy."""
        payload = _make_payload()
        payload["email_verified"] = ""
        with pytest.raises(HTTPException) as exc_info:
            _check_email_verified(payload)
        assert exc_info.value.status_code == 403

    def test_check_email_verified_with_zero(self):
        """email_verified=0 should raise — falsy."""
        payload = _make_payload()
        payload["email_verified"] = 0
        with pytest.raises(HTTPException) as exc_info:
            _check_email_verified(payload)
        assert exc_info.value.status_code == 403

    def test_is_email_verified_app_metadata_fallback(self):
        assert _is_email_verified({"app_metadata": {"email_verified": True}}) is True
        assert _is_email_verified({"email_verified": False}) is False

    def test_extract_display_name_prefers_user_metadata(self):
        name = _extract_display_name(
            {"user_metadata": {"name": "Ada"}, "raw_user_meta_data": {"name": "Other"}},
            "ada@example.com",
        )
        assert name == "Ada"

    def test_extract_display_name_falls_back_to_email_local(self):
        name = _extract_display_name({}, "ada@example.com")
        assert name == "ada"
