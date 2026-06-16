# Generative-CV API Documentation

## Overview
This document describes the RESTful API for Generative-CV, an AI-powered resume builder SaaS. The API follows FastAPI conventions and uses JWT authentication.

## API Endpoints Quick Reference

| # | Method | Path | Auth | Input | Description |
|---|--------|------|------|-------|-------------|
| | **Health** | | | | |
| 1 | GET | `/health` | No | — | Liveness probe |
| 2 | GET | `/ready` | No | — | Readiness probe |
| | **Auth** | | | | |
| 3 | POST | `/auth/signup` | No | JSON | Create a new user account |
| 4 | POST | `/auth/login` | No | JSON | Login and obtain access token |
| 5 | POST | `/auth/refresh` | Cookie | — | Refresh access token via cookie |
| 6 | POST | `/auth/logout` | Cookie | — | Clear refresh token and log out |
| 7 | POST | `/auth/forgot-password` | No | JSON | Initiate password reset |
| 8 | POST | `/auth/reset-password` | No | JSON | Reset password using token |
| 9 | GET | `/auth/verify-email` | No | Query | Verify email address |
| | **Users** | | | | |
| 10 | GET | `/users/me` | Bearer | — | Get current user profile |
| 11 | PATCH | `/users/me` | Bearer | JSON | Update current user profile |
| 12 | PATCH | `/users/me/password` | Bearer | JSON | Change current user's password |
| 13 | DELETE | `/users/me` | Bearer | JSON | Delete user account |
| | **Resumes** | | | | |
| 14 | GET | `/resumes` | Bearer | — | List user's resumes |
| 15 | POST | `/resumes` | Bearer | JSON | Create a new resume |
| 16 | GET | `/resumes/{resume_id}` | Bearer | Path | Get a specific resume |
| 17 | PATCH | `/resumes/{resume_id}` | Bearer | JSON | Update a resume |
| 18 | DELETE | `/resumes/{resume_id}` | Bearer | Path | Soft-delete a resume |
| 19 | POST | `/resumes/{resume_id}/export` | Bearer | Path | Export resume as PDF |
| 20 | POST | `/resumes/upload-scan` | Bearer | File | Upload PDF/DOCX for AI parsing |
| | **AI Suggestions** | | | | |
| 21 | POST | `/ai/suggest/summary` | Bearer | JSON | Generate/improve professional summary |
| 22 | POST | `/ai/suggest/skills` | Bearer | JSON | Suggest categorized skills |
| 23 | POST | `/ai/suggest/experience` | Bearer | JSON | Improve experience bullets |
| 24 | POST | `/ai/suggest/projects` | Bearer | JSON | Improve project descriptions |
| 25 | POST | `/ai/generate-resume` | Bearer | JSON | Generate full resume from structured data |
| 26 | POST | `/ai/optimize-resume` | Bearer | File+Text | Upload PDF + JD → optimized resume content |
| | **AI Providers** | | | | |
| 27 | GET | `/settings/ai` | Bearer | — | List AI providers |
| 28 | POST | `/settings/ai` | Bearer | JSON | Add AI provider |
| 29 | PATCH | `/settings/ai/{provider_id}` | Bearer | JSON | Update AI provider |
| 30 | DELETE | `/settings/ai/{provider_id}` | Bearer | Path | Delete AI provider |
| 31 | POST | `/settings/ai/verify` | Bearer | JSON | Verify API key + list available models |
| | **ATS Scoring** | | | | |
| 32 | POST | `/ats/score` | Bearer | JSON | Score resume text against job description |
| 33 | POST | `/ats/score-upload` | Bearer | File+Text | Upload PDF + JD → ATS score |
| 34 | GET | `/ats/history` | Bearer | Query | Get paginated ATS scan history |
| 35 | GET | `/ats/history/{scan_id}` | Bearer | Path | Get single ATS scan result |

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
Export resume as PDF file download.

**Path Parameters:**
- `resume_id`: UUID of the resume

**Responses:**
- 200 OK: `application/pdf` binary with `Content-Disposition: attachment`
- 404 Not Found: Resume not found or not owned

**Logic:**
1. Get current user from JWT token
2. Fetch resume by ID with ownership check
3. Render PDF via `render_resume_to_pdf()`
4. Return binary PDF response

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/resumes/<resume_uuid>/export \
  -H "Authorization: Bearer <access_token>" \
  -o resume.pdf
```

#### POST /resumes/upload-scan
Upload a PDF/DOCX resume for AI-powered structured parsing.

**Request Body:** Multipart form-data
- `file`: PDF or DOCX file (max 5MB)

**Responses:**
- 200 OK: Returns structured resume JSON parsed by AI
- 422 Unprocessable: File too large or unsupported format

**Logic:**
1. Validate file type (PDF/DOCX only) and size (max 5MB)
2. Extract text from the file
3. Send raw text to AI with `RESUME_PARSE_PROMPT`
4. Return structured JSON (personal info, summary, skills, experience, projects, education, etc.)

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/resumes/upload-scan \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@resume.pdf"
```

### AI Features
All AI endpoints require JWT Bearer token. They use the user's configured AI provider (decrypts API key on demand).

#### POST /ai/suggest/summary
Generate or improve a professional summary with AI.

**Request Body:**
```json
{
  "job_title": "Full Stack Developer",
  "skills": ["Python", "React", "Node.js"],
  "experience": ["3 years backend development", "Built REST APIs"],
  "job_description": "Looking for a Full Stack Developer with React and Node.js...",
  "current_summary": "Experienced developer with backend skills"    ← optional, improves this if provided
}
```

| Field | Type | Required |
|-------|------|----------|
| `job_title` | string | Yes |
| `skills` | string[] | Yes |
| `experience` | string[] | Yes |
| `job_description` | string | Yes |
| `current_summary` | string? | No — if provided, AI improves it instead of writing from scratch |

**Response:**
```json
{
  "success": true,
  "data": { "summary": "Highly skilled Full Stack Developer with 3 years of experience in Python, React, and Node.js... Built REST APIs..." },
  "error": null
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt with job title, skills, experience, job description, and optional `current_summary`
3. Call user's default AI provider
4. Return AI-generated or improved summary text

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/suggest/summary \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Full Stack Developer",
    "skills": ["Python", "React", "Node.js"],
    "experience": ["3 years backend development", "API design"],
    "job_description": "Looking for Full Stack Developer with React, Node.js, Python",
    "current_summary": "Experienced developer with backend skills"
  }'
```

#### POST /ai/suggest/skills
Suggest relevant skills (categorized) based on job description and your current skills.

**Request Body:**
```json
{
  "job_description": "Looking for a Full Stack Developer with React, Node.js, Python, and AWS...",
  "current_skills": {
    "frontend": ["React", "Next.js", "Tailwind CSS"],
    "backend": ["Express.js", "FastAPI", "Node.js"],
    "database": ["PostgreSQL", "MongoDB"],
    "devops": ["Docker", "AWS"],
    "other": ["Python", "TypeScript", "Git"]
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| `job_description` | string | Yes |
| `current_skills` | object (string → string[]) | Yes — skills grouped by category |

**Response:**
```json
{
  "success": true,
  "data": {
    "skills": {
      "frontend": ["React", "Next.js", "TypeScript"],
      "backend": ["Node.js", "Python", "REST APIs"],
      "database": ["PostgreSQL", "MongoDB"],
      "devops": ["Docker", "AWS", "CI/CD"],
      "other": ["Git", "Agile", "Problem Solving"]
    }
  },
  "error": null
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt with job description and categorized skills
3. Call AI service, parse response as categorized JSON object
4. Return suggested skills grouped by category

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/suggest/skills \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Full Stack Developer with React, Node.js, Python",
    "current_skills": {
      "frontend": ["React", "Next.js"],
      "backend": ["Express.js", "FastAPI"],
      "database": ["PostgreSQL"],
      "devops": [],
      "other": ["Python", "Git"]
    }
  }'
```

#### POST /ai/suggest/experience
Improve experience bullet points with AI. Adds company context for better suggestions.

**Request Body:**
```json
{
  "experience_bullets": ["Developed web applications", "Built REST APIs"],
  "job_role": "Full Stack Developer",
  "company": "Tech Corp",
  "duration": "Jan 2022 - Present",
  "job_description": "Looking for Full Stack Developer with React, Node.js..."
}
```

| Field | Type | Required |
|-------|------|----------|
| `experience_bullets` | string[] | Yes |
| `job_role` | string | Yes |
| `company` | string? | No |
| `duration` | string? | No |
| `job_description` | string? | No |

**Response:**
```json
{
  "success": true,
  "data": {
    "bullets": [
      "Designed and developed scalable web applications at Tech Corp using React, Node.js, and Python...",
      "Crafted robust RESTful APIs resulting in 30% reduction in development time..."
    ]
  },
  "error": null
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt with job role, company, duration, job description, and bullets
3. Call AI service, parse response as JSON array
4. Return improved bullet points

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/suggest/experience \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "experience_bullets": ["Developed web applications", "Built REST APIs"],
    "job_role": "Full Stack Developer",
    "company": "Tech Corp",
    "duration": "Jan 2022 - Present",
    "job_description": "Looking for Full Stack Developer with React, Node.js, Python"
  }'
```

#### POST /ai/suggest/projects
Improve project descriptions with AI. Provide tech stack for context.

**Request Body:**
```json
{
  "project_descriptions": ["Built an e-commerce platform with authentication"],
  "project_name": "ShopEase",
  "tech_stack": ["React", "Node.js", "PostgreSQL", "Stripe"],
  "job_description": "Looking for Full Stack Developer..."
}
```

| Field | Type | Required |
|-------|------|----------|
| `project_descriptions` | string[] | Yes |
| `project_name` | string? | No |
| `tech_stack` | string[]? | No |
| `job_description` | string? | No |

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      "Designed and developed ShopEase — a full-stack e-commerce platform featuring user authentication, payment gateway integration via Stripe, and a responsive React frontend with Node.js backend..."
    ]
  },
  "error": null
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt with project name, tech stack, job description, and descriptions
3. Call AI service, parse and normalize response as JSON array
4. Return improved project descriptions

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/suggest/projects \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "project_descriptions": ["Built e-commerce platform", "Created machine learning model"],
    "project_name": "ShopEase",
    "tech_stack": ["React", "Node.js", "PostgreSQL"],
    "job_description": "Looking for Full Stack Developer"
  }'
```

#### POST /ai/generate-resume
Generate a full resume using AI from structured existing data + job description.

**Request Body:**
```json
{
  "job_description": "Looking for a Full Stack Developer with React, Node.js...",
  "existing_data": {
    "personal": {
      "first_name": "Fujel",
      "last_name": "Patel",
      "job_title": "Web Developer Intern",
      "email": "fujel@email.com",
      "mobile": "+1234567890",
      "address": "City, State",
      "github": "github.com/fujel",
      "linkedin": "linkedin.com/in/fujel"
    },
    "summary": "Experienced developer...",
    "skills": ["Python", "React", "Node.js"],
    "experience": [
      { "company": "Tech Corp", "role": "Developer", "duration": "2022-Present", "bullets": ["Built apps"] }
    ],
    "projects": [
      { "name": "ShopEase", "description": "E-commerce platform", "tech_stack": ["React", "Node.js"] }
    ],
    "education": [
      { "institution": "University", "degree": "B.Tech", "year": "2024", "grade": "8.5" }
    ],
    "certifications": [],
    "custom_sections": []
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| `job_description` | string | Yes |
| `existing_data` | object | Yes — must match `ResumeContent` schema (personal, summary, skills, experience, projects, education, certifications, custom_sections) |

**Response:**
```json
{
  "success": true,
  "data": {
    "resume": { "personal": {...}, "summary": "...", "skills": [...], ... }
  },
  "error": null
}
```

**Logic:**
1. Get current user from JWT token
2. Build prompt combining job description and existing resume data
3. Call AI service to generate tailored resume JSON
4. Return AI-generated resume

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/generate-resume \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Full Stack Engineer position requiring React, Node.js, Python, PostgreSQL",
    "existing_data": {
      "personal": { "first_name": "Jane", "last_name": "Doe", "job_title": "Developer", "email": "jane@email.com", "mobile": "", "address": "", "github": "", "linkedin": "", "portfolio": "" },
      "summary": "",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": [],
      "projects": [],
      "education": [],
      "certifications": [],
      "custom_sections": []
    }
  }'
```

#### POST /ai/optimize-resume
Upload your PDF/DOCX resume + job description → AI parses it, then optimizes content for the target role. Keeps personal info & education intact — only changes job title, summary, skills, experience bullets, and project descriptions.

**Request:** Multipart form-data

| Field | Type | Required |
|-------|------|----------|
| `file` | File (PDF or DOCX) | Yes — max 5MB |
| `job_description` | string | Yes |

**Response:**
```json
{
  "success": true,
  "data": {
    "parsed": {
      "personal": { "first_name": "Fujel", "last_name": "Patel", "job_title": "Web Developer Intern", ... },
      "summary": "Web Developer Intern experienced in full-stack development...",
      "skills": ["Languages: JavaScript, Python", "Frontend: React.js, Next.js", ...],
      "experience": [{
        "company": "Honeybee Digital",
        "role": "Web Developer Intern",
        "duration": "12/2025 to 03/2026",
        "bullets": ["Built RESTful API routes using Flask & Python..."]
      }],
      "projects": [{ "name": "InvoiceIQ", "description": "", "tech_stack": ["Claude Vision API", "FastAPI", ...] }],
      "education": [...],
      "certifications": [],
      "custom_sections": []
    },
    "optimized": {
      "personal": { ... "job_title": "Full Stack Developer - AI Trainer" ... },
      "summary": "Highly motivated Full Stack Developer with experience in AI training...",
      "skills": ["Languages: JavaScript, TypeScript, Python", "Frontend: React.js, Next.js", "AI Tools: GitHub-Copilot, OpenCode, Claude, Gemini, Claude-Code", ...],
      "experience": [{
        "company": "Honeybee Digital",
        "role": "Web Developer Intern",
        "duration": "12/2025 to 03/2026",
        "bullets": [
          "Developed and trained AI models using Python and Flask..., resulting in a 30% increase in efficiency.",
          "Designed and implemented an automated ETL pipeline..., reducing data processing time by 25%.",
          "Optimized MySQL schema..., improving data retrieval speed by 40%."
        ]
      }],
      "projects": [{
        "name": "InvoiceIQ — AI Document Intelligence API",
        "description": "Developed a cloud-based API using Claude Vision API... improving accuracy by 20% and reducing processing time by 50%.",
        "tech_stack": ["Claude Vision API", "FastAPI", "Supabase", "Pydantic v2"]
      }],
      "education": [ ... unchanged ... ],
      "certifications": [],
      "custom_sections": []
    }
  },
  "error": null
}
```

**Logic (2-stage):**
1. Get current user from JWT token
2. **Parse**: Extract text from uploaded PDF/DOCX → send to AI with `RESUME_PARSE_PROMPT` → get structured JSON
3. **Optimize**: Send parsed data + job description to AI with `OPTIMIZE_RESUME_PROMPT` → get optimized content
4. Return both `parsed` (original) and `optimized` (tailored for the job)

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/optimize-resume \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@resume.pdf" \
  -F "job_description=DataAnnotation is looking for a Full Stack Developer - AI Trainer to help train AI models. Qualifications: JavaScript, TypeScript, Python, React..."
```

### AI Provider Settings
Manage AI provider API keys for resume generation. All endpoints require JWT Bearer token. API keys are encrypted at rest using AES-256-GCM and never returned in responses.

> **Supported providers:** `gemini`, `openrouter`, `groq`, `custom`, `nvidia-nim` (also accepts `nvidia` as alias)

#### GET /settings/ai
List all AI providers configured by the authenticated user.

**Responses:**
- 200 OK:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "provider_name": "gemini|openrouter|groq|custom|nvidia-nim",
      "base_url": "string|null",
      "model": "string|null",
      "is_default": false,
      "is_verified": false
    }
  ],
  "error": null
}
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
  "provider_name": "gemini",
  "api_key": "AIzaSy...",
  "base_url": null,
  "model": "gemini-2.0-flash",
  "is_default": true
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `provider_name` | string | Yes | One of: `gemini`, `openrouter`, `groq`, `custom`, `nvidia-nim` |
| `api_key` | string | Yes | Encrypted with AES-256-GCM at rest |
| `base_url` | string? | No | Required for `custom`, `nvidia-nim` providers. Validated against SSRF. |
| `model` | string? | No | Selected model name (e.g. `gemini-2.0-flash`, `gpt-4o-mini`) |
| `is_default` | bool | No | If `true`, clears default on other providers |

**Responses:**
- 201 Created: Returns provider info (without API key)
- 409 Conflict: Duplicate provider name for this user

**Logic:**
1. Get current user from JWT token
2. Validate `base_url` for SSRF protection
3. Encrypt API key with AES-256-GCM
4. If `is_default=True`, reset existing defaults for this user
5. Save provider to database (sets `is_verified: False`)
6. Return provider info (API key never exposed)

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/settings/ai \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"provider_name": "gemini", "api_key": "AIzaSy...", "model": "gemini-2.0-flash", "is_default": true}'
```

#### PATCH /settings/ai/{provider_id}
Update an existing AI provider configuration.

**Path Parameters:**
- `provider_id`: UUID of the AI provider

**Request Body (partial):**
```json
{
  "api_key": "sk-new-...",
  "model": "gemini-2.0-flash",
  "is_default": true
}
```

| Field | Type | Notes |
|-------|------|-------|
| `api_key` | string? | If changed, resets `is_verified` to `False` |
| `base_url` | string? | Validated against SSRF |
| `model` | string? | Change the selected model |
| `is_default` | bool? | If `true`, clears default on other providers |

**Responses:**
- 200 OK: Updated provider info
- 404 Not Found: Provider not found or not owned

**Testing:**
```bash
curl -X PATCH http://localhost:8000/api/v1/settings/ai/<provider_uuid> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"api_key": "sk-new-...", "model": "gemini-2.0-flash", "is_default": true}'
```

#### DELETE /settings/ai/{provider_id}
Delete an AI provider configuration.

**Path Parameters:**
- `provider_id`: UUID of the AI provider

**Responses:**
- 200 OK: `{ "message": "AI provider removed" }`
- 404 Not Found: Provider not found or not owned

**Testing:**
```bash
curl -X DELETE http://localhost:8000/api/v1/settings/ai/<provider_uuid> \
  -H "Authorization: Bearer <access_token>"
```

#### POST /settings/ai/verify
Verify an AI provider API key AND list available models in a single call.

**Request Body:**
```json
{
  "provider_name": "gemini",
  "api_key": "AIzaSy...",
  "base_url": null
}
```

**Response (success):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "models": ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-pro"]
  },
  "error": null
}
```

**Response (failure):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "models": null,
    "error": "API key is invalid: 400 Invalid API key"
  },
  "error": null
}
```

**Logic:**
1. Get current user from JWT token
2. Validate `base_url` for SSRF protection
3. Call provider's models-list endpoint (e.g. `GET /v1/models` or `GET /v1beta/models`) instead of chat completions — avoids needing a model before user selects one
4. If valid and provider exists in DB, mark `is_verified = True`
5. Return `{ valid, models[], error? }`

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/settings/ai/verify \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"provider_name": "gemini", "api_key": "AIzaSy..."}'
```

### ATS (Applicant Tracking System) Scores
All ATS endpoints require JWT Bearer token.

#### POST /ats/score
Score a resume against a job description using AI, and store the result.

**Request Body:**
```json
{
  "resume_text": "Experienced software engineer with Python and Django skills...",
  "job_description": "Seeking engineer with Python, Django, and AWS experience"
}
```

| Field | Type | Required |
|-------|------|----------|
| `resume_text` | string | Yes — raw resume text |
| `job_description` | string? | No — target job description |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "75ac672f-ef13-4e90-b723-d278704e9e0d",
    "user_id": "4f60623c-a9e4-4b44-a8d1-47cd04e82603",
    "resume_id": null,
    "overall_score": 82,
    "score_report": {
      "overall_score": 82,
      "section_scores": { "format": 85, "keywords": 70, "readability": 90, "completeness": 78 },
      "missing_keywords": ["Full Stack Developer", "AI Trainer"],
      "suggestions": ["Highlight experience in JavaScript, TypeScript, and Python", "Emphasize skills in React.js, Next.js, Node.js, and MySQL"]
    },
    "job_description": "Looking for a Full Stack Developer...",
    "created_at": "2026-06-16T17:21:53.082249+00:00"
  },
  "error": null
}
```

**Logic:**
1. Get current user from JWT token
2. Build ATS prompt with job description and resume text
3. Call AI service, extract JSON (handles markdown-wrapped responses)
4. Validate required keys: `overall_score`, `section_scores`, `missing_keywords`, `suggestions`
5. Create `ATSScan` record in database
6. Return scan result

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

#### POST /ats/score-upload
Upload your PDF/DOCX resume + optional job description → get ATS score. Same as `POST /ats/score` but handles file parsing automatically.

**Request:** Multipart form-data

| Field | Type | Required |
|-------|------|----------|
| `file` | File (PDF or DOCX) | Yes — max 5MB |
| `job_description` | string | No |

**Response:** Same shape as `POST /ats/score`

**Logic:**
1. Get current user from JWT token
2. Validate file type (PDF/DOCX) and size (max 5MB)
3. Extract text from file using PyMuPDF (PDF) or python-docx (DOCX)
4. Call `ats_service.score_resume()` with extracted text + job description
5. Return ATS scan result

**Testing:**
```bash
curl -X POST http://localhost:8000/api/v1/ats/score-upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@resume.pdf" \
  -F "job_description=Looking for a Full Stack Developer with React, Node.js, Python"
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
