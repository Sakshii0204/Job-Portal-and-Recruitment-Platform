-- ==========================================================
-- Job Portal and Recruitment Platform
-- Database Schema: Phase 1 (Users) & Phase 2 (Profiles, Jobs, Applications)
-- ==========================================================

-- 1. Create database if it does not already exist
CREATE DATABASE IF NOT EXISTS job_portal_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE job_portal_db;

-- 2. Create users table for authentication and role-based access
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('CANDIDATE', 'RECRUITER') NOT NULL DEFAULT 'CANDIDATE',
  phone VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create candidate_profiles table (Phase 2 Milestone 1)
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  location VARCHAR(255) DEFAULT NULL,
  summary TEXT DEFAULT NULL,
  skills TEXT DEFAULT NULL,
  education TEXT DEFAULT NULL,
  experience TEXT DEFAULT NULL,
  resume_url VARCHAR(500) DEFAULT NULL,
  linkedin_url VARCHAR(500) DEFAULT NULL,
  github_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_candidate_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create jobs table (Phase 2 Milestone 2)
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT DEFAULT NULL,
  location VARCHAR(255) NOT NULL,
  job_type ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT') NOT NULL DEFAULT 'FULL_TIME',
  work_mode ENUM('REMOTE', 'HYBRID', 'ONSITE') NOT NULL DEFAULT 'ONSITE',
  experience_required VARCHAR(100) DEFAULT NULL,
  min_salary DECIMAL(12,2) DEFAULT NULL,
  max_salary DECIMAL(12,2) DEFAULT NULL,
  deadline DATE DEFAULT NULL,
  status ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_location (location),
  INDEX idx_jobs_job_type (job_type),
  INDEX idx_jobs_work_mode (work_mode),
  CONSTRAINT fk_jobs_recruiter
    FOREIGN KEY (recruiter_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create applications table (Phase 2 Milestone 5)
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  candidate_id INT NOT NULL,
  cover_letter TEXT DEFAULT NULL,
  resume_url VARCHAR(500) DEFAULT NULL,
  status ENUM('PENDING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED') NOT NULL DEFAULT 'PENDING',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_job_candidate UNIQUE (job_id, candidate_id),
  INDEX idx_applications_candidate (candidate_id),
  INDEX idx_applications_job (job_id),
  CONSTRAINT fk_applications_job
    FOREIGN KEY (job_id) REFERENCES jobs(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_applications_candidate
    FOREIGN KEY (candidate_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
