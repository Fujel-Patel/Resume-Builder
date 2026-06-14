# Generative-CV API Documentation

## Overview
This document describes the RESTful API for Generative-CV, an AI-powered resume builder SaaS. The API follows FastAPI conventions and uses JWT authentication.

## Base URL
```
/api/v1
```

## Authentication
JWT-based authentication is required for most endpoints. Access tokens are short-lived and must be refreshed using the refresh token stored in an HttpOnly cookie.

## Endpoints

### Health Checks
#### GET /health
Liveness probe - returns 200 if process is up

#### GET /ready
Readiness probe - returns 200 if dependencies are available

### Authentication
#### POST /auth/signup
Create a new user account

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Responses:**
- 201 Created: User created successfully
- 409 Conflict: Email already registered

**Logic:** 
1. Check if user with email already exists
2. Create new user with hashed password
3. Generate email verification token
4. (In production) Send verification email
5. Return user info (without password)

**Testing:** 
```bash
curl -X POST /api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123", "name": "Test User"}'
```

#### POST /auth/login
Login and obtain access token

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Responses:**
- 200 OK: Returns access token
- 401 Unauthorized: Invalid credentials
- 423 Locked: Account locked due to failed attempts

**Logic:**
1. Authenticate user with email/password
2. Check if account is locked (too many failed attempts)
3. Check if user is active
4. Reset failed login attempts on success
5. Create access token (short-lived)
6. Create refresh token (long-lived) and set as HttpOnly cookie
7. Return access token

**Testing:**
```bash
curl -X POST /api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=test@example.com&password=securepass123'
```

#### POST /auth/refresh
Refresh access token using refresh token cookie

**Returns:** New access token

**Logic:**
1. Extract refresh token from HttpOnly cookie
2. Verify token format and signature
3. Check token against database (refresh token rotation)
4. Get user from token subject
5. Delete old refresh token (rotation)
6. Create new access token
7. Create new refresh token and set as HttpOnly cookie
8. Return new access token

**Testing:** 
Requires a valid refresh token cookie from login response

#### POST /auth/logout
Clear refresh token and log out

**Logic:**
1. Extract refresh token from cookie
2. If token exists, delete from database
3. Clear refresh token cookie
4. Return success message

**Testing:**
```bash
curl -X POST /api/v1/auth/logout \
  -b "refresh_token=<valid_token>"
```

#### POST /auth/forgot-password
Initiate password reset

**Request Body:**
```json
{
  "email": "string"
}
```

**Responses:**
- 200 OK: Success (same response regardless of email existence)

**Logic:**
1. Generic response to prevent email enumeration
2. If email exists and user is active, generate reset token
3. (In production) Send reset email with token
4. Always return same message for security

**Testing:**
```bash
curl -X POST /api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

#### POST /auth/reset-password
Reset password using token

**Request Body:**
```json
{
  "token": "string",
  "password": "string"
}
```

**Logic:**
1. Verify reset token is valid and not expired
2. Get user associated with token
3. Hash new password
4. Update user's password hash
5. Invalidate all existing refresh tokens for security
6. Return updated user info

**Testing:**
```bash
curl -X POST /api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "<reset_token>", "password": "newsecurepass123"}'
```

#### GET /auth/verify-email
Verify email address

**Query Parameters:**
- token: Verification token

**Logic:**
1. Verify email token is valid and not expired
2. Get user associated with token
3. Return user info (email now verified)

**Testing:**
```bash
curl -X GET "/api/v1/auth/verify-email?token=<verification_token>"
```

### User Management
#### GET /users/me
Get current user profile

**Returns:** User details (id, email, name, is_active, created_at, etc.)

**Logic:**
1. Extract user from JWT token via get_current_user dependency
2. Return user data (excluding sensitive fields like password hash)

**Testing:**
Requires valid access token in Authorization header:
```bash
curl -X GET /api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

#### PATCH /users/me
Update current user profile

**Request Body:**
```json
{
  "email": "string",
  "name": "string"
}
```

**Logic:**
1. Get current user from JWT token
2. Update allowed fields (email, name)
3. Save changes to database
4. Return updated user

**Testing:**
```bash
curl -X PATCH /api/v1/users/me \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "email": "newemail@example.com"}'
```

#### DELETE /users/me
Delete user account

**Logic:**
1. Get current user from JWT token
2. Delete user from database (soft delete or cascade delete related data)
3. Clear authentication cookies
4. Return success message

**Testing:**
```bash
curl -X DELETE /api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

### Resume Management
#### GET /resumes
Get all resumes belonging to the authenticated user

**Returns:** Array of resume objects (public fields only)

**Logic:**
1. Get current user from JWT token
2. Query database for all resumes belonging to user
3. Return resume list (excluding sensitive/internal fields)

**Testing:**
```bash
curl -X GET /api/v1/resumes \
  -H "Authorization: Bearer <access_token>"
```

#### POST /resumes
Create a new resume for the authenticated user

**Request Body:**
```json
{
  "title": "string",
  "data": "object", // Structured resume data
  "file_url": "string|null" // URL to generated PDF/file
}
```

**Responses:**
- 201 Created: Returns created resume object

**Logic:**
1. Get current user from JWT token
2. Validate resume data
3. Create resume record with user_id foreign key
4. Return created resume

**Testing:**
```bash
curl -X POST /api/v1/resumes \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Software Engineer Resume", "data": {"personal_info": {"name": "John Doe"}} }'
```

#### GET /resumes/{resume_id}
Get a specific resume by ID (ensures ownership)

**Path Parameters:**
- resume_id: UUID of the resume

**Returns:** Resume object if user owns it

**Logic:**
1. Get current user from JWT token
2. Fetch resume by ID from database
3. Verify resume belongs to current user (user_id match)
4. Return resume if authorized, 403 if not

**Testing:**
```bash
curl -X GET /api/v1/resumes/<resume_uuid> \
  -H "Authorization: Bearer <access_token>"
```

#### PATCH /resumes/{resume_id}
Update a resume (partial update)

**Path Parameters:**
- resume_id: UUID of the resume

**Request Body:** Partial resume fields to update

**Logic:**
1. Get current user from JWT token
2. Fetch resume by ID from database
3. Verify ownership (user_id match)
4. Update specified fields
5. Return updated resume

**Testing:**
```bash
curl -X PATCH /api/v1/resumes/<resume_uuid> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Resume Title"}'
```

#### DELETE /resumes/{resume_id}
Deactivate a resume (soft delete)

**Path Parameters:**
- resume_id: UUID of the resume

**Logic:**
1. Get current user from JWT token
2. Fetch resume by ID from database
3. Verify ownership (user_id match)
4. Mark resume as inactive/deleted (soft delete)
5. Return 204 No Content

**Testing:**
```bash
curl -X DELETE /api/v1/resumes/<resume_uuid> \
  -H "Authorization: Bearer <access_token>"
```

#### POST /resumes/generate
AI‑generation endpoint (example - Not Implemented)

**Logic:**
1. This is a placeholder endpoint demonstrating intended流程
2. Would use AI module to turn prompt into structured resume data
3. Render data into HTML (using client/template or default)
4. Export to PDF and store file URL
5. Persist resume record
6. Currently raises NotImplementedError

**Testing:** Not available (endpoint not implemented)

#### POST /resumes/{resume_id}/score
ATS scoring endpoint (example - Not Implemented)

**Path Parameters:**
- resume_id: UUID of the resume

**Logic:**
1. Placeholder for ATS scoring流程
2. Would fetch resume and extract text
3. Call ATS module to compute scores against job description
4. Return scores
5. Currently raises NotImplementedError

**Testing:** Not available (endpoint not implemented)

### AI Features
#### POST /ai/suggest/summary
Generate AI-powered professional summary

**Request Body:**
```json
{
  "job_title": "string",
  "skills": ["string"],
  "experience": ["string"],
  "job_description": "string"
}
```

**Responses:**
- 200 OK: Returns AI-generated summary

**Logic:**
1. Get current user from JWT token
2. Build prompt using job title, skills, experience, and job description
3. Call AI service to complete the prompt
4. Return AI response

**Testing:**
```bash
curl -X POST /api/v1/ai/suggest/summary \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Software Engineer",
    "skills": ["Python", "FastAPI", "PostgreSQL"],
    "experience": ["3 years backend development", "API design"],
    "job_description": "Looking for experienced backend engineer"
  }'
```

#### POST /ai/suggest/skills
Generate AI-powered skills suggestions

**Request Body:**
```json
{
  "job_description": "string",
  "current_skills": ["string"]
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt using job description and current skills
3. Call AI service to suggest additional/matching skills
4. Return AI response

**Testing:**
```bash
curl -X POST /api/v1/ai/suggest/skills \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Python/Django developer needed",
    "current_skills": ["Python", "REST APIs"]
  }'
```

#### POST /ai/suggest/experience
Improve experience bullets with AI

**Request Body:**
```json
{
  "job_role": "string",
  "job_description": "string|null",
  "experience_bullets": ["string"]
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt using job role, description, and experience bullets
3. Call AI service to improve/rewrite experience bullets
4. Return AI response

**Testing:**
```bash
curl -X POST /api/v1/ai/suggest/experience \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_role": "Software Engineer",
    "experience_bullets": ["Developed web applications", "Worked with databases"]
  }'
```

#### POST /ai/suggest/projects
Improve project descriptions with AI

**Request Body:**
```json
{
  "job_description": "string|null",
  "project_descriptions": ["string"]
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt using job description and project descriptions
3. Call AI service to improve project descriptions
4. Return AI response

**Testing:**
```bash
curl -X POST /api/v1/ai/suggest/projects \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_descriptions": ["Built e-commerce platform", "Created machine learning model"]
  }'
```

#### POST /ai/generate-resume
Generate full resume with AI

**Request Body:**
```json
{
  "job_description": "string",
  "existing_data": "object" // Current resume data as JSON
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt combining job description and existing resume data
3. Call AI service to generate improved full resume
4. Return AI response

**Testing:**
```bash
curl -X POST /api/v1/ai/generate-resume \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Full Stack Engineer position",
    "existing_data": {"personal_info": {"name": "Jane Doe"}, "skills": ["JavaScript", "React"]}
  }'
```

### AI Provider Settings (Placeholder)
#### GET /settings/ai/
List AI providers (Not Implemented)

**Logic:** Placeholder - raises NotImplementedError

#### POST /settings/ai/
Add AI provider (Not Implemented)

**Logic:** Placeholder - raises NotImplementedError

#### PATCH /settings/ai/{provider_id}
Update AI provider (Not Implemented)

**Logic:** Placeholder - raises NotImplementedError

#### DELETE /settings/ai/{provider_id}
Delete AI provider (Not Implemented)

**Logic:** Placeholder - raises NotImplementedError

#### POST /settings/ai/verify
Verify AI provider (Not Implemented)

**Logic:** Placeholder - raises NotImplementedError

### ATS (Applicant Tracking System) Scores
#### POST /ats/score
Score a resume (or raw resume text) using AI and store the result

**Request Body:**
```json
{
  "resume_text": "string",
  "job_description": "string"
}
```

**Responses:**
- 200 OK: Returns ATS scan result with scores and feedback

**Logic:**
1. Get current user from JWT token
2. Call ATS service to score resume text against job description
3. Store scan result in database associated with user
4. Return scan result including:
   - Overall score (0-100)
   - Category scores (keywords, formatting, etc.)
   - Missing keywords
   - Suggestions for improvement

**Testing:**
```bash
curl -X POST /api/v1/ats/score \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Experienced software engineer with Python and Django skills...",
    "job_description": "Seeking engineer with Python, Django, and AWS experience"
  }'
```

#### GET /ats/history
Return paginated ATS scan history for the authenticated user

**Query Parameters:**
- skip: number (default 0) - number of records to skip
- limit: number (default 100) - maximum number of records to return

**Logic:**
1. Get current user from JWT token
2. Fetch paginated ATS scan history for user from database
3. Return list of scan results

**Testing:**
```bash
curl -X GET "/api/v1/ats/history?skip=0&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

#### GET /ats/history/{scan_id}
Fetch a single ATS scan record

**Path Parameters:**
- scan_id: UUID of the ATS scan

**Logic:**
1. Get current user from JWT token
2. Fetch ATS scan by ID from database
3. Verify scan belongs to current user (user_id match)
4. Return scan if authorized, 404 if not found or not owned

**Testing:**
```bash
curl -X GET /api/v1/ats/history/<scan_uuid> \
  -H "Authorization: Bearer <access_token>"
```

## Rate Limiting
Endpoints have different rate limits configured via SlowAPI:
- Auth endpoints (/auth/*): 10 requests/minute
- AI endpoints (/ai/*): 20 requests/minute  
- ATS endpoints (/ats/*): 30 requests/minute
- Other endpoints: Default limit (typically 100 requests/minute)

## Security Features
- All authentication tokens managed via secure HttpOnly cookies
- Passwords hashed using industry-standard bcrypt
- Email verification required for full account activation
- Refresh token rotation on use (stolen tokens become invalid)
- Generic error messages to prevent enumeration attacks
- CORS configured with specific origins (no wildcards with credentials)
- SQL injection prevention via SQLAlchemy ORM
- Input validation via Pydantic models
- Route-level ownership verification for user-specific resources

## Error Responses
All API errors follow FastAPI's standard structure:
```json
{
  "detail": "Error description string"
}
```
or for validation errors:
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error message",
      "type": "error_type"
    }
  ]
}
```

## Testing the API
### Using curl
```bash
# 1. Register a new user
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123", "name": "Test User"}'

# 2. Login to get access token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=test@example.com&password=securepass123'
# Response: {"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}

# 3. Access protected endpoint
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using HTTPie
```bash
http POST :8000/api/v1/auth/signup email=test@example.com password=securepass123 name="Test User"
http POST :8000/api/v1/auth/login username=test@example.com password=securepass123
http :8000/api/v1/users/me Authorization:"Bearer <access_token>"
```

### Using Postman/Insomnia
1. Set base URL to `http://localhost:8000/api/v1`
2. For auth endpoints, use form-urlencoded for login, JSON for others
3. For protected endpoints, set Authorization header to `Bearer <token>`
4. Save tokens as variables for reuse in subsequent requests

## Development & Testing
### Running Tests
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app

# Run specific test module
pytest tests/test_auth.py
```

### Running Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation UI
FastAPI automatically provides interactive documentation:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

These interfaces allow testing endpoints directly in the browser with proper authentication.