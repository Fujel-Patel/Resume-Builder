import json
import uuid
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock, patch


def mock_result(scalar_value=None, scalars_all=None):
    result = MagicMock()
    scalars = MagicMock()
    scalars.first.return_value = scalar_value
    scalars.all.return_value = scalars_all if scalars_all is not None else []
    result.scalars.return_value = scalars
    return result

BASE = "/api/v1/ai"


class TestSuggestSummary:
    @patch("app.modules.ai.service.ai_complete")
    def test_basic(self, mock_ai, client):
        mock_ai.return_value = "A skilled software engineer with 5 years of experience."
        resp = client.post(f"{BASE}/suggest/summary", json={
            "job_title": "Software Engineer",
            "skills": ["Python", "FastAPI"],
            "experience": ["Built REST APIs"],
            "job_description": "Looking for a Python developer",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "summary" in data
        assert "software engineer" in data["summary"].lower()

    @patch("app.modules.ai.service.ai_complete")
    def test_with_current_summary(self, mock_ai, client):
        mock_ai.return_value = "Improved: skilled developer with expertise."
        resp = client.post(f"{BASE}/suggest/summary", json={
            "job_title": "Backend Developer",
            "skills": ["Go", "PostgreSQL"],
            "experience": ["Designed APIs"],
            "job_description": "Looking for a Go developer",
            "current_summary": "Old summary here",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "Improve" in data["summary"]


class TestSuggestSkills:
    @patch("app.modules.ai.service.ai_complete")
    def test_categorized(self, mock_ai, client):
        mock_ai.return_value = '{"frontend": ["React", "TypeScript"], "backend": ["Python", "FastAPI"]}'
        resp = client.post(f"{BASE}/suggest/skills", json={
            "job_description": "Full stack developer role",
            "current_skills": {
                "frontend": ["React"],
                "backend": ["Python"],
            },
        })
        assert resp.status_code == 200
        data = resp.json()["data"]["skills"]
        assert "frontend" in data
        assert "React" in data["frontend"]
        assert "Python" in data["backend"]

    @patch("app.modules.ai.service.ai_complete")
    def test_invalid_json(self, mock_ai, client):
        mock_ai.return_value = "not valid json"
        resp = client.post(f"{BASE}/suggest/skills", json={
            "job_description": "test",
            "current_skills": {"frontend": ["React"]},
        })
        assert resp.status_code == 422


class TestSuggestExperience:
    @patch("app.modules.ai.service.ai_complete")
    def test_basic(self, mock_ai, client):
        mock_ai.return_value = '["Led development of microservices", "Improved API performance by 30%"]'
        resp = client.post(f"{BASE}/suggest/experience", json={
            "experience_bullets": ["Developed stuff"],
            "job_role": "Senior Developer",
            "job_description": "Looking for a senior dev",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]["bullets"]
        assert len(data) == 2
        assert "microservices" in data[0].lower()

    @patch("app.modules.ai.service.ai_complete")
    def test_with_company_and_duration(self, mock_ai, client):
        mock_ai.return_value = '["Improved systems"]'
        resp = client.post(f"{BASE}/suggest/experience", json={
            "experience_bullets": ["Did stuff"],
            "job_role": "Engineer",
            "company": "Acme Corp",
            "duration": "2020-2023",
            "job_description": "Engineer role",
        })
        assert resp.status_code == 200


class TestSuggestProjects:
    @patch("app.modules.ai.service.ai_complete")
    def test_basic(self, mock_ai, client):
        mock_ai.return_value = '["Built a real-time dashboard"]'
        resp = client.post(f"{BASE}/suggest/projects", json={
            "project_descriptions": ["Built a dashboard"],
            "job_description": "Frontend role",
        })
        assert resp.status_code == 200
        data = resp.json()["data"]["projects"]
        assert len(data) == 1

    @patch("app.modules.ai.service.ai_complete")
    def test_with_context(self, mock_ai, client):
        mock_ai.return_value = '["Optimized data pipeline"]'
        resp = client.post(f"{BASE}/suggest/projects", json={
            "project_descriptions": ["Built pipeline"],
            "project_name": "Data Pipeline",
            "tech_stack": ["Python", "Kafka"],
            "job_description": "Data engineer role",
        })
        assert resp.status_code == 200

    @patch("app.modules.ai.service.ai_complete")
    def test_dict_response_normalized_to_list(self, mock_ai, client):
        mock_ai.return_value = '{"project": "Improved description"}'
        resp = client.post(f"{BASE}/suggest/projects", json={
            "project_descriptions": ["Old description"],
        })
        assert resp.status_code == 200
        data = resp.json()["data"]["projects"]
        assert isinstance(data, list)


class TestGenerateResume:
    @patch("app.modules.ai.service.ai_complete")
    def test_success(self, mock_ai, client):
        mock_ai.return_value = '{"personal": {"name": "John"}, "summary": "Experienced", "skills": ["Python"]}'
        resp = client.post(f"{BASE}/generate-resume", json={
            "job_description": "Python developer",
            "existing_data": {"personal": {"name": "John"}},
        })
        assert resp.status_code == 200
        data = resp.json()["data"]["resume"]
        assert data["personal"]["name"] == "John"
        assert data["summary"] == "Experienced"

    @patch("app.modules.ai.service.ai_complete")
    def test_invalid_json(self, mock_ai, client):
        mock_ai.return_value = "```json\n{\"invalid\": true\n```"
        resp = client.post(f"{BASE}/generate-resume", json={
            "job_description": "test",
            "existing_data": {},
        })
        assert resp.status_code == 422


class TestOptimizeResume:
    @patch("app.modules.ai.service.ai_complete")
    @patch("app.modules.ai.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_pdf(self, mock_extract, mock_ai, client, mock_db):
        mock_extract.return_value = "John Doe - Experienced Python developer"
        mock_ai.return_value = json.dumps({
            "parsed": {"personal": {"first_name": "John"}, "summary": "Experienced", "skills": ["Python"], "experience": [], "projects": [], "education": [], "certifications": []},
            "optimized": {"personal": {"first_name": "John"}, "summary": "Experienced Python developer with 5 years", "skills": ["Python", "FastAPI"], "experience": [], "projects": [], "education": [], "certifications": []},
        })

        mock_resume = MagicMock()
        mock_resume.id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        mock_resume.data = MagicMock()
        mock_db.execute = AsyncMock(return_value=mock_result(scalar_value=mock_resume))

        resp = client.post(
            f"{BASE}/optimize-resume",
            data={"job_description": "Python developer role"},
            files={"file": ("resume.pdf", b"%PDF-1.4 fake pdf content", "application/pdf")},
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "parsed" in data
        assert "optimized" in data
        assert data["parsed"]["personal"]["first_name"] == "John"

    @patch("app.modules.ai.service.ai_complete")
    @patch("app.modules.ai.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_docx(self, mock_extract, mock_ai, client, mock_db):
        mock_extract.return_value = "Jane Doe - Developer"
        mock_ai.return_value = json.dumps({
            "parsed": {"personal": {"first_name": "Jane"}, "summary": "Dev", "skills": ["React"], "experience": [], "projects": [], "education": [], "certifications": []},
            "optimized": {"personal": {"first_name": "Jane"}, "summary": "Optimized dev", "skills": ["React", "Next.js"], "experience": [], "projects": [], "education": [], "certifications": []},
        })

        mock_resume = MagicMock()
        mock_resume.id = uuid.UUID("00000000-0000-0000-0000-000000000002")
        mock_resume.data = MagicMock()
        mock_db.execute = AsyncMock(return_value=mock_result(scalar_value=mock_resume))

        resp = client.post(
            f"{BASE}/optimize-resume",
            data={"job_description": "Frontend role"},
            files={"file": ("resume.docx", b"fake docx content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        )
        assert resp.status_code == 200

    def test_no_file(self, client):
        resp = client.post(f"{BASE}/optimize-resume", data={"job_description": "test"})
        assert resp.status_code == 400

    def test_invalid_file_type(self, client):
        resp = client.post(
            f"{BASE}/optimize-resume",
            files={"file": ("resume.txt", b"text content", "text/plain")},
            data={"job_description": "test"},
        )
        assert resp.status_code == 400

    @patch("app.modules.ai.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_empty_extracted_text(self, mock_extract, client):
        mock_extract.return_value = ""
        resp = client.post(
            f"{BASE}/optimize-resume",
            files={"file": ("resume.pdf", b"%PDF-1.4", "application/pdf")},
            data={"job_description": "test"},
        )
        assert resp.status_code == 422


class TestOptimizeResumeStream:
    @patch("app.modules.ai.router.AsyncSessionLocal")
    @patch("app.modules.ai.service.ai_complete")
    @patch("app.modules.ai.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_stream_success(self, mock_extract, mock_ai, mock_session_local, client, mock_db):
        mock_extract.return_value = "John Doe - Experienced Python developer"
        mock_ai.return_value = json.dumps({
            "parsed": {"personal": {"first_name": "John"}, "summary": "Experienced", "skills": ["Python"], "experience": [], "projects": [], "education": [], "certifications": []},
            "optimized": {"personal": {"first_name": "John"}, "summary": "Optimized Python developer", "skills": ["Python", "FastAPI"], "experience": [], "projects": [], "education": [], "certifications": []},
        })

        mock_resume = MagicMock()
        mock_resume.id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        mock_resume.data = MagicMock()
        mock_db.execute = AsyncMock(return_value=mock_result(scalar_value=mock_resume))

        @asynccontextmanager
        async def _yield_db():
            yield mock_db

        mock_session_local.side_effect = _yield_db

        resp = client.post(
            f"{BASE}/optimize-resume/stream",
            data={"job_description": "Python developer role"},
            files={"file": ("resume.pdf", b"%PDF-1.4 fake pdf content", "application/pdf")},
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]

        events = []
        for line in resp.text.strip().split("\n\n"):
            if line.strip():
                events.append(line)

        stage_events = [e for e in events if e.startswith("event: progress")]
        assert len(stage_events) >= 5  # upload, extracting, optimizing, validating, saving

        # Find the completed event (separate event: completed)
        complete_events = [e for e in events if e.startswith("event: completed")]
        assert len(complete_events) == 1
        last = json.loads(complete_events[0].split("data: ", 1)[1])
        assert "parsed" in last
        assert "optimized" in last
        assert "resume_id" in last

    def test_stream_no_file(self, client):
        resp = client.post(
            f"{BASE}/optimize-resume/stream",
            data={"job_description": "test"},
        )
        assert resp.status_code == 400

    def test_stream_invalid_file_type(self, client):
        resp = client.post(
            f"{BASE}/optimize-resume/stream",
            files={"file": ("resume.txt", b"text content", "text/plain")},
            data={"job_description": "test"},
        )
        assert resp.status_code == 400

    @patch("app.modules.ai.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_stream_empty_text_yields_error_event(self, mock_extract, client):
        mock_extract.return_value = ""
        resp = client.post(
            f"{BASE}/optimize-resume/stream",
            files={"file": ("resume.pdf", b"%PDF-1.4", "application/pdf")},
            data={"job_description": "test"},
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]
        assert "event: error" in resp.text
        assert "PARSE_ERROR" in resp.text

    @patch("app.modules.ai.router.AsyncSessionLocal")
    @patch("app.modules.ai.service.ai_complete")
    @patch("app.modules.ai.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_stream_invalid_json_yields_error_event(self, mock_extract, mock_ai, mock_session_local, client, mock_db):
        mock_extract.return_value = "John Doe - Developer"
        mock_ai.return_value = "this is not json at all"

        @asynccontextmanager
        async def _yield_db():
            yield mock_db

        mock_session_local.side_effect = _yield_db

        resp = client.post(
            f"{BASE}/optimize-resume/stream",
            files={"file": ("resume.pdf", b"%PDF-1.4 fake", "application/pdf")},
            data={"job_description": "test"},
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]
        assert "event: error" in resp.text
        assert "AI_PROVIDER_ERROR" in resp.text

    @patch("app.modules.ai.router.AsyncSessionLocal")
    @patch("app.modules.ai.service.ai_complete")
    @patch("app.modules.ai.router.extract_text_from_bytes_async", new_callable=AsyncMock)
    def test_stream_ai_failure_yields_error_event(self, mock_extract, mock_ai, mock_session_local, client, mock_db):
        mock_extract.return_value = "John Doe - Developer"
        mock_ai.side_effect = Exception("Provider timeout")

        @asynccontextmanager
        async def _yield_db():
            yield mock_db

        mock_session_local.side_effect = _yield_db

        resp = client.post(
            f"{BASE}/optimize-resume/stream",
            files={"file": ("resume.pdf", b"%PDF-1.4 fake", "application/pdf")},
            data={"job_description": "test"},
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]
        assert "event: error" in resp.text
        assert "AI_PROVIDER_ERROR" in resp.text
