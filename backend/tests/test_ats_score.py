import uuid
from unittest.mock import AsyncMock, patch

from tests.conftest import make_scan_mock, mock_result

BASE = "/api/v1/ats"


class TestScoreResume:
    @patch("app.modules.ats.service.ai_service.ai_complete")
    def test_basic(self, mock_ai, client, mock_db):
        mock_ai.return_value = (
            '{"overall_score": 85, "section_scores": {"format": 90, "keywords": 80, '
            '"readability": 85, "completeness": 85}, "missing_keywords": ["AWS"], '
            '"suggestions": ["Add AWS experience"]}'
        )
        mock_db.execute.return_value = mock_result(scalar_value=None)

        resp = client.post(f"{BASE}/score", json={
            "resume_text": "Experienced Python developer with Django skills",
            "job_description": "Looking for Python developer with AWS",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["overall_score"] == 85
        assert "section_scores" in data["score_report"]
        assert "AWS" in data["score_report"]["missing_keywords"]

    @patch("app.modules.ats.service.ai_service.ai_complete")
    def test_without_job_description(self, mock_ai, client, mock_db):
        mock_ai.return_value = (
            '{"overall_score": 70, "section_scores": {"format": 80, "keywords": 60, '
            '"readability": 75, "completeness": 65}, "missing_keywords": [], '
            '"suggestions": ["Improve formatting"]}'
        )
        mock_db.execute.return_value = mock_result(scalar_value=None)

        resp = client.post(f"{BASE}/score", json={
            "resume_text": "Just a resume with no target job",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["overall_score"] == 70

    @patch("app.modules.ats.service.ai_service.ai_complete")
    def test_ai_returns_invalid_json(self, mock_ai, client, mock_db):
        mock_ai.return_value = "```text\nSome text that is not JSON\n```"
        mock_db.execute.return_value = mock_result(scalar_value=None)

        resp = client.post(f"{BASE}/score", json={
            "resume_text": "test resume",
        })
        assert resp.status_code == 422


class TestScoreUpload:
    @patch("app.modules.ats.service.ai_service.ai_complete")
    @patch("app.modules.ats.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_pdf(self, mock_extract, mock_ai, client, mock_db):
        mock_extract.return_value = "Extracted PDF text - Python developer"
        mock_ai.return_value = (
            '{"overall_score": 90, "section_scores": {"format": 95, "keywords": 88, '
            '"readability": 90, "completeness": 87}, "missing_keywords": [], '
            '"suggestions": ["Great resume"]}'
        )
        mock_db.execute.return_value = mock_result(scalar_value=None)

        resp = client.post(
            f"{BASE}/score-upload",
            files={"file": ("resume.pdf", b"%PDF-1.4 content", "application/pdf")},
            data={"job_description": "Python developer role"},
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["overall_score"] == 90

    @patch("app.modules.ats.service.ai_service.ai_complete")
    @patch("app.modules.ats.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_docx(self, mock_extract, mock_ai, client, mock_db):
        mock_extract.return_value = "Extracted DOCX text"
        mock_ai.return_value = (
            '{"overall_score": 78, "section_scores": {"format": 80, "keywords": 75, '
            '"readability": 82, "completeness": 75}, "missing_keywords": ["Docker"], '
            '"suggestions": []}'
        )
        mock_db.execute.return_value = mock_result(scalar_value=None)

        resp = client.post(
            f"{BASE}/score-upload",
            files={"file": ("resume.docx", b"docx content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["overall_score"] == 78

    def test_invalid_file_type(self, client):
        resp = client.post(
            f"{BASE}/score-upload",
            files={"file": ("resume.txt", b"text", "text/plain")},
        )
        assert resp.status_code == 400

    def test_no_file(self, client):
        resp = client.post(f"{BASE}/score-upload")
        assert resp.status_code == 400

    @patch("app.modules.ats.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_empty_extracted_text(self, mock_extract, client):
        mock_extract.return_value = ""
        resp = client.post(
            f"{BASE}/score-upload",
            files={"file": ("resume.pdf", b"%PDF-1.4", "application/pdf")},
        )
        assert resp.status_code == 422


class TestHistory:
    def test_list_empty(self, client, mock_db):
        mock_db.execute.return_value = mock_result(scalars_all=[])
        resp = client.get(f"{BASE}/history")
        assert resp.status_code == 200
        assert resp.json()["data"] == []

    def test_list_with_scans(self, client, mock_db):
        scan = make_scan_mock()
        mock_db.execute.return_value = mock_result(scalars_all=[scan])
        resp = client.get(f"{BASE}/history")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert len(data) == 1
        assert data[0]["overall_score"] == 85

    def test_get_single_found(self, client, mock_db):
        scan_id = uuid.uuid4()
        scan = make_scan_mock(id=scan_id)
        mock_db.execute.return_value = mock_result(scalar_value=scan)
        resp = client.get(f"{BASE}/history/{scan_id}")
        assert resp.status_code == 200
        assert resp.json()["data"]["overall_score"] == 85

    def test_get_single_not_found(self, client, mock_db):
        mock_db.execute.return_value = mock_result(scalar_value=None)
        resp = client.get(f"{BASE}/history/{uuid.uuid4()}")
        assert resp.status_code == 404

    def test_get_wrong_owner(self, client, mock_db):
        scan = make_scan_mock(user_id=uuid.uuid4())
        mock_db.execute.return_value = mock_result(scalar_value=scan)
        resp = client.get(f"{BASE}/history/{scan.id}")
        assert resp.status_code == 404
