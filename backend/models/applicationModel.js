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
}

module.exports = ApplicationModel;
