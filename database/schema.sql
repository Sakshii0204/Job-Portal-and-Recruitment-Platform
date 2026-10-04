-- ==========================================================
-- Job Portal and Recruitment Platform
-- Phase 1: Database Schema & Users Table
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
