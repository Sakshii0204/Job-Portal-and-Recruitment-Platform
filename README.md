# Job Portal and Recruitment Platform

A modern full-stack web application designed for candidate job searching and recruiter talent acquisition, developed systematically in structured phases.

> **Current Status**: **Phase 1, Phase 2 & Phase 3 Complete** (Recruiter Module Active)  
> **Repository**: [https://github.com/Sakshii0204/Job-Portal-and-Recruitment-Platform](https://github.com/Sakshii0204/Job-Portal-and-Recruitment-Platform)  
> **Developer**: Sakshii0204

---

## 📌 Project Overview

This platform connects candidates seeking career opportunities with recruiters hiring top talent. The project is developed across 5 distinct phases:

- **Phase 1 (Completed)**: Project Foundation, MySQL Database, JWT Authentication, Bcrypt Hashing, Role-Based Access Control (RBAC), and Dashboards.
- **Phase 2 (Completed)**: Complete Candidate Module — Profile Management, Jobs Database, Server-Side Search & Filtering, Job Details, One-Click Application Submission, Duplicate Prevention, and Application Tracking.
- **Phase 3 (Completed)**: Complete Recruiter Module — Dashboard Analytics, Job Posting & Management, Applicant Review Pipeline, Status Lifecycle (`PENDING` -> `SHORTLISTED` -> `ACCEPTED` / `REJECTED`), and Strict Cross-Recruiter Ownership Enforcement.
- **Phase 4 (Upcoming)**: Interview Scheduling, Notification Workflows, and Email Alerts.
- **Phase 5 (Upcoming)**: Advanced Filters, Admin Controls, and Cloud Deployment.

---

## ✨ Features by Phase

### Phase 1 — Foundation & Authentication
- **Full-Stack Architecture**: Clean separation between React (Vite) frontend and Node.js (Express) backend.
- **Relational Database**: MySQL 8.0 schema for the `users` table with indexing on email and role.
- **Authentication & Security**:
  - Secure registration & login with input validation.
  - Bcrypt password hashing (10 salt rounds) — zero plain-text passwords stored.
  - Signed JSON Web Tokens (JWT) with user ID and role payload.
  - Authentication middleware verifying Bearer tokens.
  - Centralized `/api/auth/me` endpoint.
- **Role-Based Authorization (RBAC)**:
  - Backend enforcement via `requireRole('CANDIDATE')` and `requireRole('RECRUITER')`.
  - Unauthorized role requests receive `403 Forbidden`.
- **Frontend Routing & State**:
  - Global `AuthContext` with `localStorage` token synchronization.
  - Protected routes guarding unauthorized or unauthenticated navigation.

### Phase 2 — Candidate Module
- **Candidate Profile Management**:
  - Dedicated `candidate_profiles` table linked via foreign key to `users.id` with `ON DELETE CASCADE`.
  - Candidate endpoints `GET /api/candidate/profile` and `PUT /api/candidate/profile`.
  - Edit personal and professional information: Location, Bio/Summary, Technical Skills, Education, Work Experience, Resume URL, LinkedIn URL, GitHub URL.
  - Candidate user ID strictly extracted from the verified JWT (client-side user IDs ignored).
- **Jobs Database & Seed Records**:
  - Relational `jobs` table with recruiter foreign key, salary decimals, job types, work modes, and active status.
  - Realistic demo job seed data in `database/seed.sql` for instant development and testing.
- **Job Listing, Search & Server-Side Filtering**:
  - `GET /api/jobs` with server-side pagination (`page`, `limit`).
  - Search across job title, company name, location, and required skills using parameterized SQL.
  - Structured filters for Location, Job Type (`FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT`), Work Mode (`REMOTE`, `HYBRID`, `ONSITE`), Min Salary, and Max Salary.
- **Job Details & Specifications**:
  - `GET /api/jobs/:id` returning complete role details, salary range, qualifications, and deadline.
  - Real-time application status check (`/api/applications/status/:jobId`).
  - Contextual action buttons: "Apply Now", "Already Applied", or "Applications Closed".
- **Job Application Submission & Duplicate Prevention**:
  - `applications` table with `UNIQUE (job_id, candidate_id)` constraint.
  - `POST /api/applications` accepting cover letter and resume URL.
  - Automatic `409 Conflict` response if candidate attempts duplicate application.
- **My Applications & Application Tracking**:
  - `GET /api/applications/my` fetching all jobs applied to with company name, location, applied date, and status.

### Phase 3 — Complete Recruiter Module
- **Recruiter Analytics Dashboard**:
  - `GET /api/recruiter/dashboard/stats` aggregates real statistics strictly isolated to the logged-in recruiter.
  - Metrics: Total Jobs, Active Jobs, Closed Jobs, Total Applications Received, Pending, Shortlisted, Accepted, and Rejected applications.
  - Quick action widgets, recent postings table with applicant counters, and recent application feed with direct review navigation.
- **Job Creation & Ownership Enforcement**:
  - `POST /api/recruiter/jobs` allows recruiters to post opportunities.
  - Ownership is strictly derived from the verified JWT (`req.user.id`). Recruiter ID sent from frontend is never trusted.
  - Form validation: title, company, description, location, allowed enums (`FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT` and `REMOTE`, `HYBRID`, `ONSITE`), salary logic (`min <= max`), and valid future deadlines.
- **Recruiter Job Management**:
  - `GET /api/recruiter/jobs`: Returns only jobs posted by the logged-in recruiter along with live `application_count`.
  - `GET /api/recruiter/jobs/:id`: Fetch single job details for editing (guarded by ownership check).
  - `PUT /api/recruiter/jobs/:id`: Update role title, description, skills, salary, location, or deadline. Attempt by any other recruiter yields `403 Forbidden`.
- **Safe Job Closure & Application History Preservation**:
  - `PUT /api/recruiter/jobs/:id/close`: Soft-closes job (`status = 'CLOSED'`).
  - Closed jobs stop accepting new applications (`400 Bad Request`).
  - Existing candidate applications and historical records remain fully preserved and accessible to the recruiter and applicant.
  - Destructive deletion is blocked if applications exist.
- **Applicant Pipeline & Candidate Profile Inspection**:
  - `GET /api/recruiter/jobs/:jobId/applications`: Lists all applicants for a specific job, joining candidate details and profile info (skills, location, resume URL).
  - `GET /api/recruiter/applications/:id`: Full view of candidate profile (cover letter, work experience, education, LinkedIn, GitHub, resume link).
  - Cross-recruiter applicant inspection is rejected with `403 Forbidden`.
- **Application Status Lifecycle Management**:
  - `PUT /api/recruiter/applications/:id/status` allows transitions: `PENDING` -> `SHORTLISTED` -> `ACCEPTED` / `REJECTED`.
  - Validates allowed enum values. Invalid statuses rejected with `400 Bad Request`.
  - Recruiter ownership check through relational join `application -> job -> recruiter_id === req.user.id`.
  - Candidate's *My Applications* page automatically reflects the updated status upon refresh.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM 6, Axios, Vanilla CSS |
| **Backend** | Node.js, Express.js (REST API, Parameterized SQL) |
| **Database** | MySQL 8.0 (Relational tables with foreign key cascades and unique constraints) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Bcrypt password hashing (`bcryptjs`) |

---

## 🗄️ Database Architecture

```text
users (id, name, email, password, role, phone, created_at, updated_at)
  │
  ├─► candidate_profiles (id, user_id [FK], location, summary, skills, education, experience, resume_url, linkedin_url, github_url)
  │
  └─► jobs (id, recruiter_id [FK], title, company_name, description, required_skills, location, job_type, work_mode, experience_required, min_salary, max_salary, deadline, status, created_at, updated_at)
        │
        └─► applications (id, job_id [FK], candidate_id [FK], cover_letter, resume_url, status, applied_at, updated_at)
              [UNIQUE KEY: (job_id, candidate_id)]
```

---

## 🚀 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new candidate or recruiter |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Return profile of logged-in user |

### Candidate Module (`/api/candidate` & `/api/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/candidate/profile` | Role: CANDIDATE | Retrieve candidate profile |
| `PUT` | `/api/candidate/profile` | Role: CANDIDATE | Update candidate profile |
| `GET` | `/api/jobs` | Public / Candidate | Search, filter & paginate active jobs |
| `GET` | `/api/jobs/:id` | Public / Candidate | View job specifications |
| `POST` | `/api/applications` | Role: CANDIDATE | Apply for a job (`409` duplicate check) |
| `GET` | `/api/applications/my` | Role: CANDIDATE | Track status of all submitted applications |
| `GET` | `/api/applications/status/:jobId` | Role: CANDIDATE | Check if candidate already applied |

### Recruiter Module (`/api/recruiter`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/recruiter/dashboard/stats` | Role: RECRUITER | Aggregate stats & recent activity for logged-in recruiter |
| `POST` | `/api/recruiter/jobs` | Role: RECRUITER | Create new job posting (ownership bound to JWT user) |
| `GET` | `/api/recruiter/jobs` | Role: RECRUITER | List own posted jobs with application counts |
| `GET` | `/api/recruiter/jobs/:id` | Role: RECRUITER | Fetch single owned job for editing |
| `PUT` | `/api/recruiter/jobs/:id` | Role: RECRUITER | Update owned job posting (`403` if not owner) |
| `PUT` | `/api/recruiter/jobs/:id/close` | Role: RECRUITER | Soft-close job (`status = 'CLOSED'`) |
| `DELETE` | `/api/recruiter/jobs/:id` | Role: RECRUITER | Safe delete job (`400` if applications exist) |
| `GET` | `/api/recruiter/jobs/:jobId/applications` | Role: RECRUITER | View all applicants for an owned job |
| `GET` | `/api/recruiter/applications/:id` | Role: RECRUITER | View candidate details & application information |
| `PUT` | `/api/recruiter/applications/:id/status` | Role: RECRUITER | Update application status (`PENDING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`) |

---

## 🔒 Authorization & Security Architecture

1. **Role Guarding**: All recruiter routes pass through `authenticateToken` followed by `requireRole('RECRUITER')`. Candidates are blocked with `403 Forbidden`.
2. **Resource Ownership Checks**: Every job and application query verifies `job.recruiter_id === req.user.id`. Recruiter B cannot view or modify Recruiter A's postings or applicants.
3. **No Frontend Trust**: Recruiter ID and Candidate ID are never accepted from request parameters or bodies. They are strictly extracted from verified JWT tokens.
4. **Parameterized SQL Queries**: All database queries use MySQL prepared statements to prevent SQL injection.
5. **No Password Leakage**: Passwords and bcrypt hashes are excluded from all query outputs and API responses.

---

## 🧭 Recruiter Workflow

```text
Register (Role: RECRUITER)
  └─► Login
        └─► Recruiter Dashboard (/recruiter/dashboard)
              ├─► Overview Statistics (Jobs, Applications, Shortlisted, Accepted)
              ├─► Post Job (/recruiter/jobs/create)
              │     └─► Fill role details, salary range, qualifications, deadline
              ├─► Manage My Jobs (/recruiter/jobs)
              │     ├─► Edit Job (/recruiter/jobs/:id/edit)
              │     ├─► Close Job (Soft-close; halts new applicants)
              │     └─► View Applicants (/recruiter/jobs/:jobId/applications)
              └─► Review Applicant Details (/recruiter/applications/:id)
                    ├─► View Cover letter, Resume, Skills, Experience
                    └─► Manage Status: [Shortlist] -> [Accept] / [Reject]
```

---

## 🧪 Testing & Verification

Automated test suites verify Phase 1, Phase 2, and Phase 3:

```bash
# Run Phase 2 Candidate Workflow Test
node backend/test/phase2Workflow.test.js

# Run Phase 3 Recruiter Workflow Test
node backend/test/phase3Workflow.test.js
```

### Verified Phase 3 Test Matrix:
- [x] Recruiter A & Recruiter B independent registration and JWT authentication
- [x] Recruiter A dashboard isolated statistics
- [x] Recruiter A job creation with `req.user.id` binding
- [x] Recruiter A retrieves own jobs with real application counts
- [x] Recruiter A edits own job posting
- [x] Candidate applies to Job A (Status: `PENDING`)
- [x] Recruiter A views applicants for Job A
- [x] Recruiter A views detailed candidate profile & resume links
- [x] Recruiter A updates status: `PENDING` -> `SHORTLISTED` -> `ACCEPTED`
- [x] Candidate *My Applications* reflects `ACCEPTED` status
- [x] **Recruiter B edit Job A**: Blocked (`403 Forbidden`)
- [x] **Recruiter B view applicants of Job A**: Blocked (`403 Forbidden`)
- [x] **Recruiter B view applicant details**: Blocked (`403 Forbidden`)
- [x] **Recruiter B update application status**: Blocked (`403 Forbidden`)
- [x] **Recruiter B close Job A**: Blocked (`403 Forbidden`)
- [x] **Recruiter B delete Job A**: Blocked (`403 Forbidden`)
- [x] Candidate accessing recruiter endpoints blocked (`403 Forbidden`)
- [x] Recruiter accessing candidate profile endpoints blocked (`403 Forbidden`)
- [x] Recruiter A closes Job A (`status = 'CLOSED'`)
- [x] Application to closed job blocked (`400 Bad Request`)
- [x] Application history preserved after job closure
- [x] Invalid status transition rejected (`400 Bad Request`)
- [x] Frontend production build compiles with zero errors

---

## 📦 How to Run Locally

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env file with DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT=5000
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit the app at: `http://localhost:5173`
