# Job Portal and Recruitment Platform

A modern full-stack web application designed for candidate job searching and recruiter talent acquisition, developed systematically in structured phases.

> **Current Status**: **Phase 1 & Phase 2 Complete** (Candidate Module Active)  
> **Repository**: [https://github.com/Sakshii0204/Job-Portal-and-Recruitment-Platform](https://github.com/Sakshii0204/Job-Portal-and-Recruitment-Platform)  
> **Developer**: Sakshii0204

---

## 📌 Project Overview

This platform connects candidates seeking career opportunities with recruiters hiring top talent. The project is developed across 5 distinct phases:

- **Phase 1 (Completed)**: Project Foundation, MySQL Database, JWT Authentication, Bcrypt Hashing, Role-Based Access Control (RBAC), and Dashboards.
- **Phase 2 (Completed)**: Complete Candidate Module — Profile Management, Jobs Database, Server-Side Search & Filtering, Job Details, One-Click Application Submission, Duplicate Prevention, and Application Tracking.
- **Phase 3 (Upcoming)**: Recruiter Job Posting, Applicant Review Pipeline, and Status Management.
- **Phase 4 (Upcoming)**: Interview Scheduling, Notification Workflows, and Email Alerts.
- **Phase 5 (Upcoming)**: Analytics Dashboard, Advanced Filters, Admin Controls, and Cloud Deployment.

---

## ✨ Phase 1 & Phase 2 Features

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

### Phase 2 — Complete Candidate Module
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
  - Strict validations: checks job existence, active status, unexpired deadline, and duplicate submissions (`409 Conflict`).
  - Initial status set automatically to `PENDING`.
- **Application Tracking (My Applications)**:
  - `GET /api/applications/my` returning all candidate applications with job title, company, location, applied date, and status.
  - Status badges for `PENDING`, `SHORTLISTED`, `ACCEPTED`, and `REJECTED`.
  - Secure isolation: candidates can never view another user's applications.
- **Interactive Candidate Dashboard**:
  - Profile completion progress bar with contextual tips.
  - Real-time metrics counters: Total Applications, In Review/Pending, Shortlisted/Accepted.
  - Quick action hub and preview of recent applications.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript (ES6+), React Router DOM v6, Axios, Vanilla CSS |
| **Backend** | Node.js, Express.js, JavaScript |
| **Database** | MySQL 8.0 (mysql2 promise connection pool) |
| **Security** | JWT (jsonwebtoken), Bcrypt (bcryptjs), CORS, Dotenv |
| **Tools** | Git, GitHub, VS Code, Postman |

---

## 📁 Project Structure

```text
Job-Portal-and-Recruitment-Platform/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool & startup health check
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me endpoints
│   │   ├── candidateProfileController.js # Profile GET & PUT
│   │   ├── jobController.js      # Job list, filter, search & details
│   │   ├── applicationController.js # Job application & tracking
│   │   └── testController.js     # Role verification test handlers
│   ├── middleware/
│   │   ├── authMiddleware.js     # Bearer JWT verification
│   │   ├── roleMiddleware.js     # RBAC authorization (CANDIDATE / RECRUITER)
│   │   └── errorMiddleware.js    # 404 and centralized error handler
│   ├── models/
│   │   ├── userModel.js          # Parameterized SQL for users table
│   │   ├── candidateProfileModel.js # Parameterized SQL for candidate_profiles
│   │   ├── jobModel.js           # Parameterized SQL for jobs search/filter
│   │   └── applicationModel.js   # Parameterized SQL for applications table
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── candidateRoutes.js    # /api/candidate (profile & tests)
│   │   ├── jobRoutes.js          # /api/jobs (public/candidate active jobs)
│   │   ├── applicationRoutes.js  # /api/applications (apply & my applications)
│   │   ├── recruiterRoutes.js    # /api/recruiter
│   │   └── healthRoutes.js       # /api/health
│   ├── services/
│   │   ├── authService.js        # Auth logic, hashing & JWT issue
│   │   ├── candidateProfileService.js # Profile business logic & validation
│   │   ├── jobService.js         # Job query normalization & pagination
│   │   └── applicationService.js # Application validation & duplicate checks
│   ├── utils/
│   │   ├── generateToken.js      # JWT signing helper
│   │   └── validation.js         # Input validation helpers
│   ├── server.js                 # Express app mounting routes & CORS
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── schema.sql                # Complete schema (users, candidate_profiles, jobs, applications)
│   └── seed.sql                  # Realistic demo recruiter & job postings
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive navigation with role links
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx# Client-side route & role guards
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & handlers
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page with API health status
│   │   │   ├── Login.jsx         # Sign in with role-based redirection
│   │   │   ├── Register.jsx      # Sign up with role selection
│   │   │   ├── Jobs.jsx          # Search & filter jobs list with pagination
│   │   │   ├── JobDetails.jsx    # Full job spec & Apply modal
│   │   │   ├── CandidateProfile.jsx # View & edit candidate profile
│   │   │   ├── MyApplications.jsx # Application tracking & status badges
│   │   │   ├── CandidateDashboard.jsx # Candidate workspace & metrics
│   │   │   ├── RecruiterDashboard.jsx # Recruiter workspace
│   │   │   ├── Unauthorized.jsx  # 403 Forbidden page
│   │   │   └── NotFound.jsx      # 404 Not Found page
│   │   ├── services/
│   │   │   ├── api.js            # Axios client with interceptors
│   │   │   └── authService.js    # Frontend API calls
│   │   ├── App.jsx               # App routes
│   │   ├── index.css             # Comprehensive design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Database Setup

The database schema contains 4 core tables:
1. `users` — Candidate and Recruiter authentication records.
2. `candidate_profiles` — Profile details linked 1:1 with candidate user.
3. `jobs` — Active and closed job postings.
4. `applications` — Job applications with `UNIQUE(job_id, candidate_id)`.

### 1. Run Schema Script
```bash
mysql -u root -p < database/schema.sql
```

### 2. Populate Development Seed Data (Jobs & Recruiter)
```bash
mysql -u root -p < database/seed.sql
```

---

## ⚙️ Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=job_portal_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
# Root helper (or run npm install in each directory)
npm run install:all
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on: **`http://localhost:5000`**

### 3. Start Frontend Development Server
In a separate terminal:
```bash
cd frontend
npm run dev
```
Frontend runs on: **`http://localhost:5173`**

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Candidate or Recruiter |
| `POST` | `/api/auth/login` | Public | Sign in and receive signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### Candidate Profile (`/api/candidate`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/candidate/profile` | Role: CANDIDATE | Retrieve candidate profile details |
| `PUT` | `/api/candidate/profile` | Role: CANDIDATE | Update candidate profile & links |
| `GET` | `/api/candidate/test` | Role: CANDIDATE | Role verification endpoint |

### Jobs (`/api/jobs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | Public / Candidate | List active jobs with search, filters & pagination |
| `GET` | `/api/jobs/:id` | Public / Candidate | Retrieve detailed job posting by ID |

**Supported Job Query Parameters**:  
`search`, `location`, `jobType`, `workMode`, `experience`, `minSalary`, `maxSalary`, `page`, `limit`

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/applications` | Role: CANDIDATE | Submit job application (`409` on duplicate) |
| `GET` | `/api/applications/my` | Role: CANDIDATE | List all applications submitted by candidate |
| `GET` | `/api/applications/my/:id` | Role: CANDIDATE | Retrieve specific application details |
| `GET` | `/api/applications/status/:jobId` | Role: CANDIDATE | Check if candidate applied to job |

---

## 🧭 Candidate Workflow

```text
Register (Role: CANDIDATE)
  └─► Login
        └─► Candidate Dashboard
              ├─► Complete Profile (/candidate/profile)
              ├─► Browse & Search Jobs (/jobs)
              │     └─► Filter by Location, Type, Salary
              │     └─► View Job Details (/jobs/:id)
              │           └─► Apply Now (Cover Letter & Resume URL)
              └─► Track Status in My Applications (/candidate/applications)
                    └─► Review Status: PENDING / SHORTLISTED / ACCEPTED / REJECTED
```

---

## 🧪 Testing Phase 2

Run the automated regression test suite:
```bash
node -e "/* Automated test runner */"
```

Checklist verified:
- [x] Candidate profiles table and foreign key cascade
- [x] Jobs table with active seed records
- [x] Applications table with unique constraint `(job_id, candidate_id)`
- [x] Candidate profile retrieval and update
- [x] Recruiter access to candidate endpoints blocked with `403 Forbidden`
- [x] Job search and parameterized filtering
- [x] Job details and `404` error handling for invalid IDs
- [x] Application submission with initial status `PENDING`
- [x] Duplicate application prevention (`409 Conflict`)
- [x] Candidate isolation in My Applications
- [x] Complete frontend build with zero errors

---

## 📦 Git & GitHub

Repository: [https://github.com/Sakshii0204/Job-Portal-and-Recruitment-Platform](https://github.com/Sakshii0204/Job-Portal-and-Recruitment-Platform)  
Branch: `main`
