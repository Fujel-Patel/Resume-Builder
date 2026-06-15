# Generative-CV API Documentation

## Overview
This document describes the RESTful API for Generative-CV, an AI-powered resume builder SaaS. The API follows FastAPI conventions and uses JWT authentication.

## API Endpoints Quick Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness probe |
| GET | `/ready` | Readiness probe |
| **Auth** | | |
| POST | `/auth/signup` | Create a new user account |
| POST | `/auth/login` | Login and obtain access token |
| POST | `/auth/refresh` | Refresh access token via cookie |
| POST | `/auth/logout` | Clear refresh token and log out |
| POST | `/auth/forgot-password` | Initiate password reset |
| POST | `/auth/reset-password` | Reset password using token |
| GET | `/auth/verify-email` | Verify email address |
| **Users** | | |
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update current user profile |
| PATCH | `/users/me/password` | Change current user's password |
| DELETE | `/users/me` | Delete user account |
| **Resumes** | | |
| GET | `/resumes` | List user's resumes |
| POST | `/resumes` | Create a new resume |
| GET | `/resumes/{resume_id}` | Get a specific resume |
| PATCH | `/resumes/{resume_id}` | Update a resume |
| DELETE | `/resumes/{resume_id}` | Soft-delete a resume |
| POST | `/resumes/{resume_id}/export` | Export resume as PDF (501) |
| POST | `/resumes/upload-scan` | Upload resume for AI parsing (501) |
| **AI** | | |
| POST | `/ai/suggest/summary` | Generate professional summary |
| POST | `/ai/suggest/skills` | Suggest skills |
| POST | `/ai/suggest/experience` | Improve experience bullets |
| POST | `/ai/suggest/projects` | Improve project descriptions |
| POST | `/ai/generate-resume` | Generate full resume |
| **AI Providers** | | |
| GET | `/settings/ai` | List AI providers |
| POST | `/settings/ai` | Add AI provider |
| PATCH | `/settings/ai/{provider_id}` | Update AI provider |
| DELETE | `/settings/ai/{provider_id}` | Delete AI provider |
| POST | `/settings/ai/verify` | Verify AI provider key |
| **ATS** | | |
| POST | `/ats/score` | Score resume against job description |
| GET | `/ats/history` | Get paginated ATS scan history |
| GET | `/ats/history/{scan_id}` | Get single ATS scan result |

## Base URL
```
/api/v1
```

## Authentication
JWT-based authentication is required for most endpoints. Access tokens (15 min expiry) are sent via `Authorization: Bearer` header. Refresh tokens (7 day expiry) are stored in an HttpOnly, Secure, SameSite=Strict cookie and rotated on each use.

## Response Format
All endpoints return a consistent envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

**Validation Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A validation error occurred",
    "fields": {
      "field_name": "Error message"
    }
  }
}
```

## Endpoints

### Health Checks
#### GET /health
Liveness probe - returns 200 if process is up. Does not hit the database.

**Responses:**
- 200 OK: `{ "status": "healthy" }`

#### GET /ready
Readiness probe - returns 200 only when database connection succeeds.

**Responses:**
- 200 OK: `{ "status": "ready" }`
- 503 Service Unavailable: Database ping failed

### Authentication
All auth endpoints are exempt from authentication.

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "string (1-255 chars)",
  "email": "string (valid email)",
  "password": "string (8-72 chars, must include uppercase, lowercase, digit, and special char)"
}
```

**Responses:**
- 201 Created: User created successfully
- 409 Conflict: DuplicateEmailException - email already registered

**Logic:**
1. Validate password complexity (upper, lower, digit, special)
2. Create user with bcrypt-hashed password (12 rounds)
3. Generate email verification token (24 hour expiry)
4. (In production) Send verification email
5. Return user info (without password hash)

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!", "name": "Test User"}'
```

#### POST /auth/login
Login with email and password. Returns access token and sets refresh token cookie.

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Responses:**
- 200 OK: Returns access token + sets `refresh_token` HttpOnly cookie
- 401 Unauthorized: InvalidCredentialsException
- 423 Locked: AccountLockedException - account temporarily locked

**Logic:**
1. Look up user by email
2. Verify password with bcrypt
3. Check if account is locked (5 failed attempts = 15 min lockout)
4. Check if user is active
5. Reset failed login attempts on success
6. Create access token (JWT, 15 min, signed with `JWT_ACCESS_SECRET`)
7. Create refresh token (random 32-byte token, SHA-256 hash stored in DB, 7 day expiry)
8. Set refresh token as HttpOnly, Secure, SameSite=Strict cookie
9. Return access token in response body

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'
```

#### POST /auth/refresh
Refresh access token using the refresh token stored in the HttpOnly cookie.

**Responses:**
- 200 OK: New access token + rotated refresh token cookie
- 401 Unauthorized: Invalid or expired refresh token

**Logic:**
1. Extract refresh token from HttpOnly cookie
2. Verify JWT signature with `JWT_REFRESH_SECRET`
3. Hash token and look up in `refresh_tokens` table
4. Verify user exists and is active
5. Delete old refresh token from DB (rotation prevents reuse)
6. Create new access token (15 min)
7. Create new refresh token (7 days), store hash in DB, set as cookie
8. Return new access token

**Testing:**
Requires a valid refresh token cookie from login response.

#### POST /auth/logout
Clear refresh token and log out.

**Responses:**
- 200 OK: `{ "message": "Logged out successfully" }`

**Logic:**
1. Extract refresh token from cookie
2. If token is valid, delete its hash from database
3. Clear refresh token cookie (set empty, expired)
4. Return success message

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -b "refresh_token=<valid_token>"
```

#### POST /auth/forgot-password
Initiate password reset. Always returns the same message regardless of email existence (anti-enumeration).

**Request Body:**
```json
{
  "email": "string (valid email)"
}
```

**Responses:**
- 200 OK: Generic success message

**Logic:**
1. Always return same response to prevent email enumeration
2. If email exists and user is active, generate password reset token (type: `reset_password`, 1 hour expiry)
3. (In production) Send reset email with token
4. Return generic success message

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

#### POST /auth/reset-password
Reset password using a token obtained via email.

**Request Body:**
```json
{
  "token": "string",
  "password": "string (8-72 chars, must include uppercase, lowercase, digit, and special char)"
}
```

**Responses:**
- 200 OK: `{ "message": "Password reset successfully" }`
- 400 Bad Request: InvalidTokenException - token expired or invalid

**Logic:**
1. Verify reset token is valid and not expired
2. Get user associated with token
3. Hash new password with bcrypt (12 rounds)
4. Update user's password hash
5. Delete ALL refresh tokens for this user (security measure)
6. Return success message

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "<reset_token>", "password": "NewSecurePass123!"}'
```

#### GET /auth/verify-email
Verify email address using token.

**Query Parameters:**
- `token`: Verification token

**Responses:**
- 200 OK: `{ "message": "Email verified successfully" }`
- 400 Bad Request: InvalidTokenException

**Logic:**
1. Verify email token is valid and not expired (type: `verify_email`, 24 hour expiry)
2. Mark user as `is_verified = True`
3. Delete used token from database
4. Return success message

**Testing:**
```bash
curl -X GET "http://localhost:8000/api/v1/auth/verify-email?token=<verification_token>"
```

### User Management
All user endpoints require JWT Bearer token via `Authorization: Bearer` header.

#### GET /users/me
Get current user profile.

**Responses:**
- 200 OK:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "avatar_url": "string|null",
  "is_verified": false,
  "is_active": true,
  "created_at": "datetime",
  "updated_at": "datetime|null"
}
```

**Logic:**
1. Extract user from JWT token via `get_current_user` dependency
2. Return user data (excluding sensitive fields like password hash)

**Testing:**
```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

#### PATCH /users/me
Update current user profile.

**Request Body:**
```json
{
  "name": "string|null",
  "avatar_url": "string|null"
}
```

**Responses:**
- 200 OK: Returns updated user profile

**Logic:**
1. Get current user from JWT token
2. Update only provided fields (partial update via `exclude_unset`)
3. Save changes to database
4. Return updated user

**Testing:**
```bash
curl -X PATCH http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "avatar_url": "https://example.com/avatar.jpg"}'
```

#### PATCH /users/me/password
Change current user's password.

**Request Body:**
```json
{
  "current_password": "string",
  "new_password": "string (8-72 chars, must include uppercase, lowercase, digit, and special char)"
}
```

**Responses:**
- 200 OK: `{ "message": "Password changed successfully" }`
- 400 Bad Request: Invalid current password or weak new password

**Logic:**
1. Get current user from JWT token
2. Verify current password against stored hash
3. Validate new password complexity
4. Hash new password with bcrypt
5. Update user's password hash
6. Delete ALL refresh tokens for this user (forces re-login)
7. Return success message

**Testing:**
```bash
curl -X PATCH http://localhost:8000/api/v1/users/me/password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"current_password": "SecurePass123!", "new_password": "NewSecurePass456!"}'
```

#### DELETE /users/me
Permanently delete user account.

**Request Body:**
```json
{
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Responses:**
- 200 OK: `{ "message": "Account deleted successfully" }`

**Logic:**
1. Get current user from JWT token
2. Validate confirmation string (must be exactly "DELETE MY ACCOUNT")
3. Hard-delete user from database (cascades to related records)
4. Return success message

**Testing:**
```bash
curl -X DELETE http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"confirmation": "DELETE MY ACCOUNT"}'
```

### Resume Management
All resume endpoints require JWT Bearer token. Ownership is enforced by scoping queries to `user_id`; unauthorized access returns 404 (not 403).

#### GET /resumes
Get all resumes belonging to the authenticated user.

**Returns:** Array of resume objects (excludes deleted resumes).

**Logic:**
1. Get current user from JWT token
2. Query database for all non-deleted resumes belonging to user, ordered by `created_at` desc
3. Return resume list with associated `data` (ResumeData)

**Testing:**
```bash
curl -X GET http://localhost:8000/api/v1/resumes \
  -H "Authorization: Bearer <access_token>"
```

#### POST /resumes
Create a new resume for the authenticated user.

**Request Body:**
```json
{
  "title": "string (1-255 chars)",
  "template_id": "classic|modern|minimal|creative",
  "content": {
    "personal": { ... },
    "summary": "string",
    "skills": ["string"],
    "experience": [ ... ],
    "projects": [ ... ],
    "education": [ ... ],
    "certifications": [ ... ],
    "custom_sections": [ ... ]
  }
}
```

**Responses:**
- 201 Created: Returns created resume object

**Logic:**
1. Get current user from JWT token
2. Create Resume record with user_id, title, and template_id
3. Create associated ResumeData record (one-to-one) with provided content
4. Return created resume with data

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/resumes \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Software Engineer Resume", "template_id": "modern", "content": {"summary": "Experienced developer", "skills": ["Python", "FastAPI"]}}'
```

#### GET /resumes/{resume_id}
Get a specific resume by ID (ownership enforced).

**Path Parameters:**
- `resume_id`: UUID of the resume

**Responses:**
- 200 OK: Resume object
- 404 Not Found: Resume not found or not owned by user

**Logic:**
1. Get current user from JWT token
2. Fetch resume by ID scoped to `user_id` (ownership baked into query)
3. Return resume if found, 404 otherwise

**Testing:**
```bash
curl -X GET http://localhost:8000/api/v1/resumes/<resume_uuid> \
  -H "Authorization: Bearer <access_token>"
```

#### PATCH /resumes/{resume_id}
Update a resume (partial update).

**Path Parameters:**
- `resume_id`: UUID of the resume

**Request Body (partial):**
```json
{
  "title": "string",
  "template_id": "string",
  "content": {
    "personal": { ... },
    "summary": "string",
    "skills": ["string"],
    "experience": [ ... ],
    "projects": [ ... ],
    "education": [ ... ],
    "certifications": [ ... ],
    "custom_sections": [ ... ]
  }
}
```

**Responses:**
- 200 OK: Updated resume object
- 404 Not Found: Resume not found or not owned

**Logic:**
1. Get current user from JWT token
2. Fetch resume by ID with ownership check
3. Update only provided fields on Resume metadata and/or ResumeData sections
4. Return updated resume

**Testing:**
```bash
curl -X PATCH http://localhost:8000/api/v1/resumes/<resume_uuid> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Resume Title"}'
```

#### DELETE /resumes/{resume_id}
Soft-delete a resume.

**Path Parameters:**
- `resume_id`: UUID of the resume

**Responses:**
- 200 OK: `{ "message": "Resume deleted" }`
- 404 Not Found: Resume not found or not owned

**Logic:**
1. Get current user from JWT token
2. Fetch resume by ID with ownership check
3. Set `is_deleted = True` and `deleted_at` timestamp
4. Return success message

**Testing:**
```bash
curl -X DELETE http://localhost:8000/api/v1/resumes/<resume_uuid> \
  -H "Authorization: Bearer <access_token>"
```

#### POST /resumes/{resume_id}/export
Export resume as PDF (Not Implemented - returns 501).

**Path Parameters:**
- `resume_id`: UUID of the resume

**Responses:**
- 501 Not Implemented

**Testing:** Not available (endpoint not implemented).

#### POST /resumes/upload-scan
Upload a PDF/DOCX resume for AI parsing (Not Implemented - returns 501).

**Request Body:** Multipart form upload (PDF or DOCX, max 5MB).

**Responses:**
- 501 Not Implemented

**Testing:** Not available (endpoint not implemented).

### AI Features
All AI endpoints require JWT Bearer token. They use the user's configured AI provider (decrypts API key on demand).

#### POST /ai/suggest/summary
Generate AI-powered professional summary.

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
- 200 OK: `{ "summary": "string" }`

**Logic:**
1. Get current user from JWT token
2. Build prompt using job title, skills, experience, and job description
3. Call user's default AI provider to complete the prompt
4. Return AI-generated summary

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/suggest/summary \
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
Generate AI-powered skills suggestions.

**Request Body:**
```json
{
  "job_description": "string",
  "current_skills": ["string"]
}
```

**Responses:**
- 200 OK: `{ "skills": ["string", ...] }`

**Logic:**
1. Get current user from JWT token
2. Build prompt using job description and current skills
3. Call AI service, parse response as JSON array of skills
4. Return suggested skills

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/suggest/skills \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Python/Django developer needed",
    "current_skills": ["Python", "REST APIs"]
  }'
```

#### POST /ai/suggest/experience
Improve experience bullets with AI.

**Request Body:**
```json
{
  "job_role": "string",
  "job_description": "string|null",
  "experience_bullets": ["string"]
}
```

**Responses:**
- 200 OK: `{ "bullets": ["string", ...] }`

**Logic:**
1. Get current user from JWT token
2. Build prompt using job role, description, and experience bullets
3. Call AI service, parse response as JSON array of improved bullets
4. Return improved bullets

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/suggest/experience \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_role": "Software Engineer",
    "experience_bullets": ["Developed web applications", "Worked with databases"]
  }'
```

#### POST /ai/suggest/projects
Improve project descriptions with AI.

**Request Body:**
```json
{
  "job_description": "string|null",
  "project_descriptions": ["string"]
}
```

**Responses:**
- 200 OK: `{ "projects": ["string", ...] }`

**Logic:**
1. Get current user from JWT token
2. Build prompt using job description and project descriptions
3. Call AI service, parse response as JSON array
4. Return improved project descriptions

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/suggest/projects \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_descriptions": ["Built e-commerce platform", "Created machine learning model"]
  }'
```

#### POST /ai/generate-resume
Generate full resume with AI.

**Request Body:**
```json
{
  "job_description": "string",
  "existing_data": {}
}
```

**Responses:**
- 200 OK: `{ "resume": { ... } }`

**Logic:**
1. Get current user from JWT token
2. Build prompt combining job description and existing resume data
3. Call AI service to generate improved full resume
4. Return AI-generated resume JSON

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/generate-resume \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Full Stack Engineer position",
    "existing_data": {"personal_info": {"name": "Jane Doe"}, "skills": ["JavaScript", "React"]}
  }'
```

### AI Provider Settings
Manage AI provider API keys for resume generation. All endpoints require JWT Bearer token. API keys are encrypted at rest using AES-256-GCM and never returned in responses.

#### GET /settings/ai
List all AI providers configured by the authenticated user.

**Responses:**
- 200 OK:
```json
[
  {
    "id": "uuid",
    "provider_name": "anthropic|gemini|nvidia-nim|custom",
    "base_url": "string|null",
    "is_default": false,
    "is_verified": false
  }
]
```

**Logic:**
1. Get current user from JWT token
2. Query all AI providers belonging to user
3. Return provider list (API key is NEVER included)

**Testing:**
```bash
curl -X GET http://localhost:8000/api/v1/settings/ai \
  -H "Authorization: Bearer <access_token>"
```

#### POST /settings/ai
Add a new AI provider configuration.

**Request Body:**
```json
{
  "provider_name": "anthropic|gemini|nvidia-nim|custom",
  "api_key": "string",
  "base_url": "string|null",
  "is_default": false
}
```

**Validation:**
- `provider_name` must be one of: `anthropic`, `gemini`, `nvidia-nim`, `custom`
- `base_url` is validated against SSRF attacks (blocks localhost, private IPs, cloud metadata IPs)
- Duplicate `(user_id, provider_name)` pair returns 409 Conflict

**Responses:**
- 201 Created: Returns provider info (without API key)
- 409 Conflict: Duplicate provider name for this user

**Logic:**
1. Get current user from JWT token
2. Validate `base_url` for SSRF protection
3. Encrypt API key with AES-256-GCM
4. If `is_default=True`, reset existing defaults for this user
5. Save provider to database
6. Return provider info (API key never exposed)

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/settings/ai \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"provider_name": "anthropic", "api_key": "sk-ant-...", "is_default": true}'
```

#### PATCH /settings/ai/{provider_id}
Update an existing AI provider configuration.

**Path Parameters:**
- `provider_id`: UUID of the AI provider

**Request Body (partial):**
```json
{
  "api_key": "string|null",
  "base_url": "string|null",
  "is_default": true|null
}
```

**Responses:**
- 200 OK: Updated provider info
- 404 Not Found: Provider not found or not owned

**Logic:**
1. Get current user from JWT token
2. Fetch provider by ID scoped to user (ownership check)
3. Validate `base_url` if provided (SSRF protection)
4. If `api_key` changes, reset `is_verified` to False
5. If `is_default=True`, clear existing defaults for this user
6. Save changes and return updated provider

**Testing:**
```bash
curl -X PATCH http://localhost:8000/api/v1/settings/ai/<provider_uuid> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"api_key": "sk-new-...", "is_default": true}'
```

#### DELETE /settings/ai/{provider_id}
Delete an AI provider configuration.

**Path Parameters:**
- `provider_id`: UUID of the AI provider

**Responses:**
- 200 OK: `{ "message": "AI provider removed" }`
- 404 Not Found: Provider not found or not owned

**Logic:**
1. Get current user from JWT token
2. Fetch provider by ID scoped to user
3. Delete from database
4. Return success message

**Testing:**
```bash
curl -X DELETE http://localhost:8000/api/v1/settings/ai/<provider_uuid> \
  -H "Authorization: Bearer <access_token>"
```

#### POST /settings/ai/verify
Verify an AI provider API key by making a test call.

**Request Body:**
```json
{
  "provider_name": "anthropic|gemini|nvidia-nim|custom",
  "api_key": "string",
  "base_url": "string|null"
}
```

**Responses:**
- 200 OK:
```json
{
  "valid": true
}
```

**Logic:**
1. Get current user from JWT token
2. Validate `base_url` for SSRF protection
3. Make a minimal test call to the provider ("Reply with just: OK", max_tokens=5)
4. If call succeeds and provider exists in DB, mark `is_verified = True`
5. Return validation result

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/settings/ai/verify \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"provider_name": "anthropic", "api_key": "sk-ant-..."}'
```

### ATS (Applicant Tracking System) Scores
All ATS endpoints require JWT Bearer token.

#### POST /ats/score
Score a resume against a job description using AI, and store the result.

**Request Body:**
```json
{
  "resume_text": "string",
  "job_description": "string|null"
}
```

**Responses:**
- 200 OK:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "resume_id": null,
  "overall_score": 85,
  "score_report": {
    "overall_score": 85,
    "section_scores": { ... },
    "missing_keywords": ["string"],
    "suggestions": ["string"]
  },
  "job_description": "string",
  "created_at": "datetime"
}
```

**Logic:**
1. Get current user from JWT token
2. Build ATS prompt with job description and resume text
3. Call AI service, validate response contains required keys: `overall_score`, `section_scores`, `missing_keywords`, `suggestions`
4. Create `ATSScan` record in database
5. Return scan result

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ats/score \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Experienced software engineer with Python and Django skills...",
    "job_description": "Seeking engineer with Python, Django, and AWS experience"
  }'
```

#### GET /ats/history
Return paginated ATS scan history for the authenticated user.

**Query Parameters:**
- `skip`: int (default 0) - number of records to skip
- `limit`: int (default 50, max 100) - maximum number of records to return

**Logic:**
1. Get current user from JWT token
2. Fetch paginated ATS scan history for user, ordered by `created_at` desc
3. Return list of scan results

**Testing:**
```bash
curl -X GET "http://localhost:8000/api/v1/ats/history?skip=0&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

#### GET /ats/history/{scan_id}
Fetch a single ATS scan record.

**Path Parameters:**
- `scan_id`: UUID of the ATS scan

**Responses:**
- 200 OK: Scan result object
- 404 Not Found: Scan not found or not owned

**Logic:**
1. Get current user from JWT token
2. Fetch ATS scan by ID from database
3. Verify scan belongs to current user (returns 404 if not)
4. Return scan result

**Testing:**
```bash
curl -X GET http://localhost:8000/api/v1/ats/history/<scan_uuid> \
  -H "Authorization: Bearer <access_token>"
```

## Authentication Flow Summary

1. **Signup** → Create account (no token returned)
2. **Login** → Receive `access_token` in body + `refresh_token` in HttpOnly cookie
3. **Access protected endpoints** → Send `Authorization: Bearer <access_token>`
4. **When access token expires (15 min)** → Call `/auth/refresh` (cookie sent automatically)
5. **Logout** → Call `/auth/logout` to invalidate refresh token

## Rate Limiting
A global rate limiter is configured via SlowAPI middleware:
- Default: 100 requests per minute per client
- Rate limit is applied globally across all endpoints (exemptions for `/health` and `/ready`)

## Security Features
- All authentication tokens managed via secure HttpOnly, Secure, SameSite=Strict cookies
- Passwords hashed using bcrypt (12 rounds, 72-byte input limit enforced)
- Email verification required for full account activation
- Refresh token rotation on use (stolen tokens become invalid after use)
- Generic error messages to prevent enumeration attacks
- CORS configured with specific origins (no wildcards with credentials)
- SQL injection prevention via SQLAlchemy ORM
- Input validation via Pydantic models
- Route-level ownership verification for user-specific resources (always returns 404)
- AES-256-GCM encryption for stored AI provider API keys
- SSRF protection on user-supplied URLs (blocks private IPs, localhost, metadata endpoints)
- Password complexity enforced (upper, lower, digit, special character, 8-72 chars minimum)

## Testing the API
### Using curl
```bash
# 1. Register a new user
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!", "name": "Test User"}'

# 2. Login to get access token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'
# Response: {"success": true, "data": {"access_token": "eyJ...", "token_type": "bearer"}, "error": null}

# 3. Access protected endpoint
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJ..."
```

### Using HTTPie
```bash
http POST :8000/api/v1/auth/signup email=test@example.com password='SecurePass123!' name="Test User"
http POST :8000/api/v1/auth/login email=test@example.com password='SecurePass123!'
http :8000/api/v1/users/me Authorization:"Bearer <access_token>"
```

### Using Postman/Insomnia
1. Set base URL to `http://localhost:8000/api/v1`
2. For JSON endpoints, set Content-Type to `application/json`
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
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation UI
FastAPI automatically provides interactive documentation (development only):
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc
