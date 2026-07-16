import uuid
from unittest.mock import AsyncMock, patch

import pytest

from tests.conftest import USER_ID, make_provider_mock, mock_result

BASE = "/api/v1/settings/ai"


class TestListProviders:
    def test_empty(self, client, mock_db):
        mock_db.execute.return_value = mock_result(scalars_all=[])
        resp = client.get(BASE)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"] == []

    def test_with_providers(self, client, mock_db):
        p1 = make_provider_mock(provider_name="gemini", is_default=True, is_verified=True)
        mock_db.execute.return_value = mock_result(scalars_all=[p1])
        resp = client.get(BASE)
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert len(data) == 1
        assert data[0]["provider_name"] == "gemini"
        assert data[0]["is_default"] is True
        assert data[0]["is_verified"] is True


class TestCreateProvider:
    def test_success(self, client, mock_db):
        mock_db.execute.return_value = mock_result(scalar_value=None)

        resp = client.post(BASE, json={
            "provider_name": "gemini",
            "api_key": "AIzaSy-test",
            "is_default": True,
        })
        assert resp.status_code == 201
        data = resp.json()["data"]
        assert data["provider_name"] == "gemini"
        assert data["is_default"] is True
        assert data["is_verified"] is False

    def test_duplicate(self, client, mock_db):
        existing = make_provider_mock(provider_name="gemini")
        mock_db.execute.return_value = mock_result(scalar_value=existing)

        resp = client.post(BASE, json={
            "provider_name": "gemini",
            "api_key": "AIzaSy-test",
        })
        assert resp.status_code == 409
        body = resp.json()
        assert body["detail"]["code"] == "CONFLICT"

    def test_invalid_provider_name(self, client, mock_db):
        resp = client.post(BASE, json={
            "provider_name": "invalid-provider",
            "api_key": "test-key",
        })
        assert resp.status_code == 400

    def test_missing_base_url_for_custom(self, client, mock_db):
        resp = client.post(BASE, json={
            "provider_name": "custom",
            "api_key": "test-key",
        })
        assert resp.status_code == 400

    def test_with_model(self, client, mock_db):
        mock_db.execute.return_value = mock_result(scalar_value=None)

        resp = client.post(BASE, json={
            "provider_name": "groq",
            "api_key": "gsk-test",
            "model": "mixtral-8x7b-32768",
        })
        assert resp.status_code == 201
        data = resp.json()["data"]
        assert data["model"] == "mixtral-8x7b-32768"

    def test_with_is_verified(self, client, mock_db):
        mock_db.execute.return_value = mock_result(scalar_value=None)

        resp = client.post(BASE, json={
            "provider_name": "groq",
            "api_key": "gsk-test",
            "is_verified": True,
        })
        assert resp.status_code == 201
        data = resp.json()["data"]
        assert data["is_verified"] is True


class TestUpdateProvider:
    PROVIDER_ID = uuid.uuid4()

    @patch("app.modules.ai_providers.router.encrypt")
    def test_success(self, mock_encrypt, client, mock_db):
        provider = make_provider_mock(
            id=self.PROVIDER_ID, provider_name="gemini", model="gemini-1.5-flash"
        )
        mock_db.execute.return_value = mock_result(scalar_value=provider)
        mock_encrypt.return_value = "encrypted:new-key"

        resp = client.patch(f"{BASE}/{self.PROVIDER_ID}", json={
            "api_key": "new-key",
            "model": "gemini-2.0-flash",
            "is_default": True,
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["model"] == "gemini-2.0-flash"
        assert data["is_default"] is True

    def test_not_found(self, client, mock_db):
        mock_db.execute.return_value = mock_result(scalar_value=None)
        resp = client.patch(f"{BASE}/{uuid.uuid4()}", json={"api_key": "x"})
        assert resp.status_code == 404


class TestDeleteProvider:
    PROVIDER_ID = uuid.uuid4()

    def test_success(self, client, mock_db):
        provider = make_provider_mock(id=self.PROVIDER_ID)
        mock_db.execute.return_value = mock_result(scalar_value=provider)

        resp = client.delete(f"{BASE}/{self.PROVIDER_ID}")
        assert resp.status_code == 200
        assert resp.json()["data"]["message"] == "AI provider removed"

    def test_not_found(self, client, mock_db):
        mock_db.execute.return_value = mock_result(scalar_value=None)
        resp = client.delete(f"{BASE}/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestVerifyProvider:
    @patch("app.modules.ai_providers.router.verify_api_key")
    def test_success(self, mock_verify, client, mock_db):
        mock_verify.return_value = (
            True,
            "",
            [{"id": "gemini-2.0-flash"}, {"id": "gemini-1.5-flash"}],
        )
        mock_db.execute.return_value = mock_result(
            scalar_value=make_provider_mock(provider_name="gemini")
        )

        resp = client.post(f"{BASE}/verify", json={
            "provider_name": "gemini",
            "api_key": "AIzaSy-test",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["valid"] is True
        assert len(data["models"]) == 2

    @patch("app.modules.ai_providers.router.verify_api_key")
    def test_failure(self, mock_verify, client, mock_db):
        mock_verify.return_value = (False, "API key is invalid: 400 Bad Request", [])

        resp = client.post(f"{BASE}/verify", json={
            "provider_name": "gemini",
            "api_key": "bad-key",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["valid"] is False
        assert "error" in data

    def test_unknown_provider(self, client, mock_db):
        resp = client.post(f"{BASE}/verify", json={
            "provider_name": "unknown",
            "api_key": "test",
        })
        assert resp.status_code == 400
