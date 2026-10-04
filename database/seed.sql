-- ==========================================================
-- Job Portal and Recruitment Platform
-- Phase 2: Development Seed Data (Demo Jobs & Recruiter)
-- ==========================================================

USE job_portal_db;

-- 1. Insert a demo recruiter if one does not already exist
-- Default demo password: Password123! (bcrypt hashed)
INSERT INTO users (name, email, password, role, phone)
SELECT 'Acme Talent Partner', 'recruiter.demo@example.com', '$2a$10$tZ2wR881N8gBkW2yL7wz7.QJgJ9m4VnZ5V7F2I0I4N3t0uV7T7.8q', 'RECRUITER', '9876543211'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'recruiter.demo@example.com'
);

-- 2. Insert realistic sample active jobs
SET @recruiter_id = (SELECT id FROM users WHERE role = 'RECRUITER' LIMIT 1);

INSERT INTO jobs (recruiter_id, title, company_name, description, required_skills, location, job_type, work_mode, experience_required, min_salary, max_salary, deadline, status)
VALUES
(
  @recruiter_id,
  'Full Stack Developer',
  'TechCorp Solutions',
  'We are seeking a versatile Full Stack Developer to build and maintain modern web applications. You will collaborate with cross-functional teams to design clean REST APIs, optimize database queries, and deliver intuitive frontend user experiences.',
  'React, Node.js, Express, MySQL, REST APIs, Git',
  'Pune',
  'FULL_TIME',
  'HYBRID',
  '2-4 Years',
  600000.00,
  1100000.00,
  DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY),
  'ACTIVE'
),
(
  @recruiter_id,
  'React Frontend Engineer',
  'Innovate Labs',
  'Join our product development team to create high-performance web applications with React. You will transform Figma designs into responsive components, manage state with modern React patterns, and ensure cross-browser compatibility.',
  'React, JavaScript (ES6+), HTML5, CSS3, Vite, Axios',
  'Bangalore',
  'FULL_TIME',
  'REMOTE',
  '1-3 Years',
  500000.00,
  950000.00,
  DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY),
  'ACTIVE'
),
(
  @recruiter_id,
  'Java Backend Engineer',
  'CloudNexus Technologies',
  'Looking for a passionate Java Developer responsible for core application architecture and scalable microservices. Responsibilities include writing robust unit tests, tuning MySQL queries, and integrating third-party payment and auth APIs.',
  'Java 17, Spring Boot, MySQL, Hibernate, REST APIs, Docker',
  'Hyderabad',
  'FULL_TIME',
  'ONSITE',
  '3-5 Years',
  800000.00,
  1400000.00,
  DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY),
  'ACTIVE'
),
(
  @recruiter_id,
  'Python & Data Engineer',
  'DataVibe Analytics',
  'Help us build high-throughput data processing workflows and modern REST backends with Python. Experience with asynchronous processing and relational databases is required.',
  'Python, FastAPI, Django, MySQL, Pandas, Redis',
  'Mumbai',
  'FULL_TIME',
  'REMOTE',
  '2-5 Years',
  700000.00,
  1200000.00,
  DATE_ADD(CURRENT_DATE, INTERVAL 40 DAY),
  'ACTIVE'
),
(
  @recruiter_id,
  'Software Engineer Intern',
  'NextGen Softwares',
  'Excellent opportunity for recent graduates or early career engineers to learn full-stack web engineering in a fast-paced environment. Mentorship provided across JavaScript, React, and backend architectures.',
  'JavaScript, Problem Solving, Data Structures, Git, Basic SQL',
  'Pune',
  'INTERNSHIP',
  'HYBRID',
  '0-1 Year',
  250000.00,
  400000.00,
  DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY),
  'ACTIVE'
),
(
  @recruiter_id,
  'DevOps & Cloud Engineer',
  'Apex Systems Global',
  'Seeking an experienced DevOps Engineer to streamline our continuous integration and delivery pipelines, maintain container orchestrations, and enforce cloud security baselines.',
  'Docker, Kubernetes, AWS, Linux, CI/CD, Terraform, Git',
  'Delhi NCR',
  'CONTRACT',
  'REMOTE',
  '3-6 Years',
  1200000.00,
  1800000.00,
  DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY),
  'ACTIVE'
);
