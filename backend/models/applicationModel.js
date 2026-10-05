const { pool } = require('../config/db');

class ApplicationModel {
  /**
   * Check if candidate has already applied to a job
   */
  static async findByJobAndCandidate(jobId, candidateId) {
    const query = `
      SELECT id, job_id, candidate_id, status, applied_at
      FROM applications
      WHERE job_id = ? AND candidate_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [jobId, candidateId]);
    return rows[0] || null;
  }

  /**
   * Create new job application
   */
  static async create({ jobId, candidateId, coverLetter, resumeUrl }) {
    const query = `
      INSERT INTO applications (job_id, candidate_id, cover_letter, resume_url, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `;
    const values = [
      jobId,
      candidateId,
      coverLetter ? coverLetter.trim() : null,
      resumeUrl ? resumeUrl.trim() : null
    ];
    const [result] = await pool.execute(query, values);
    return {
      id: result.insertId,
      job_id: jobId,
      candidate_id: candidateId,
      cover_letter: coverLetter || null,
      resume_url: resumeUrl || null,
      status: 'PENDING'
    };
  }

  /**
   * Fetch all applications of a candidate with job details
   */
  static async findCandidateApplications(candidateId) {
    const query = `
      SELECT 
        a.id,
        a.id AS application_id,
        a.job_id,
        a.candidate_id,
        a.cover_letter,
        a.resume_url,
        a.status,
        a.status AS application_status,
        a.applied_at,
        a.updated_at,
        j.title AS job_title,
        j.company_name,
        j.location,
        j.job_type,
        j.work_mode,
        j.min_salary,
        j.max_salary,
        j.status AS job_status,
        j.deadline
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.candidate_id = ?
      ORDER BY a.applied_at DESC
    `;
    const [rows] = await pool.execute(query, [candidateId]);
    return rows;
  }

  /**
   * Fetch single application belonging to a specific candidate
   */
  static async findApplicationById(id, candidateId) {
    const query = `
      SELECT 
        a.id AS application_id,
        a.job_id,
        a.candidate_id,
        a.cover_letter,
        a.resume_url,
        a.status AS application_status,
        a.applied_at,
        a.updated_at,
        j.title AS job_title,
        j.company_name,
        j.location,
        j.job_type,
        j.work_mode,
        j.min_salary,
        j.max_salary,
        j.description,
        j.required_skills,
        j.status AS job_status,
        j.deadline
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ? AND a.candidate_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id, candidateId]);
    return rows[0] || null;
  }

  /**
   * Fetch all applicants for a job verifying recruiter ownership
   */
  static async findApplicationsByJobAndRecruiter(jobId, recruiterId) {
    const query = `
      SELECT 
        a.id AS application_id,
        a.job_id,
        a.candidate_id,
        a.cover_letter,
        a.resume_url,
        a.status AS application_status,
        a.applied_at,
        a.updated_at,
        u.name AS candidate_name,
        u.email AS candidate_email,
        u.phone AS candidate_phone,
        cp.location AS candidate_location,
        cp.summary AS candidate_summary,
        cp.skills AS candidate_skills,
        cp.education AS candidate_education,
        cp.experience AS candidate_experience,
        cp.resume_url AS profile_resume_url,
        cp.linkedin_url,
        cp.github_url,
        j.title AS job_title,
        j.company_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
      WHERE a.job_id = ? AND j.recruiter_id = ?
      ORDER BY a.applied_at DESC
    `;
    const [rows] = await pool.execute(query, [jobId, recruiterId]);
    return rows;
  }

  /**
   * Fetch single applicant details by application ID verifying recruiter ownership
   */
  static async findApplicationByIdAndRecruiter(applicationId, recruiterId) {
    const query = `
      SELECT 
        a.id,
        a.id AS application_id,
        a.job_id,
        a.candidate_id,
        a.cover_letter,
        a.resume_url,
        a.status,
        a.status AS application_status,
        a.applied_at,
        a.updated_at,
        u.name AS candidate_name,
        u.email AS candidate_email,
        u.phone AS candidate_phone,
        cp.location AS candidate_location,
        cp.summary AS candidate_summary,
        cp.skills AS candidate_skills,
        cp.education AS candidate_education,
        cp.experience AS candidate_experience,
        cp.resume_url AS profile_resume_url,
        cp.linkedin_url,
        cp.github_url,
        j.title AS job_title,
        j.company_name,
        j.location AS job_location,
        j.job_type,
        j.work_mode,
        j.status AS job_status,
        j.recruiter_id
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
      WHERE a.id = ? AND j.recruiter_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [applicationId, recruiterId]);
    return rows[0] || null;
  }

  /**
   * Update application status verifying recruiter ownership of the related job
   */
  static async updateStatus(applicationId, recruiterId, status) {
    // 1. Verify existence and ownership
    const existing = await this.findApplicationByIdAndRecruiter(applicationId, recruiterId);
    if (!existing) return null;

    // 2. Perform update
    const updateQuery = `
      UPDATE applications
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await pool.execute(updateQuery, [status.toUpperCase(), applicationId]);

    return this.findApplicationByIdAndRecruiter(applicationId, recruiterId);
  }

  /**
   * Aggregate application counts for a recruiter across all their jobs
   */
  static async getRecruiterApplicationStats(recruiterId) {
    const query = `
      SELECT 
        COUNT(a.id) AS total_applications,
        SUM(CASE WHEN a.status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN a.status = 'SHORTLISTED' THEN 1 ELSE 0 END) AS shortlisted,
        SUM(CASE WHEN a.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted,
        SUM(CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = ?
    `;
    const [rows] = await pool.execute(query, [recruiterId]);
    return {
      totalApplications: Number(rows[0]?.total_applications || 0),
      pending: Number(rows[0]?.pending || 0),
      shortlisted: Number(rows[0]?.shortlisted || 0),
      accepted: Number(rows[0]?.accepted || 0),
      rejected: Number(rows[0]?.rejected || 0)
    };
  }

  /**
   * Fetch recent applications received by a recruiter across all jobs
   */
  static async findRecentApplicationsByRecruiter(recruiterId, limit = 5) {
    const query = `
      SELECT 
        a.id AS application_id,
        a.job_id,
        a.candidate_id,
        a.status AS application_status,
        a.applied_at,
        u.name AS candidate_name,
        u.email AS candidate_email,
        j.title AS job_title,
        j.company_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      WHERE j.recruiter_id = ?
      ORDER BY a.applied_at DESC
      LIMIT ?
    `;
    const [rows] = await pool.execute(query, [recruiterId, String(limit)]);
    return rows;
  }
}

module.exports = ApplicationModel;

