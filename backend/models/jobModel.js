const { pool } = require('../config/db');

class JobModel {
  /**
   * Search and filter active jobs with server-side pagination
   */
  static async findAll({
    search,
    location,
    jobType,
    workMode,
    experience,
    minSalary,
    maxSalary,
    page = 1,
    limit = 10
  }) {
    const whereClauses = ["j.status = 'ACTIVE'"];
    const params = [];

    // Search query: title, company_name, location, or required_skills
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereClauses.push(
        '(j.title LIKE ? OR j.company_name LIKE ? OR j.location LIKE ? OR j.required_skills LIKE ?)'
      );
      params.push(term, term, term, term);
    }

    // Filter by location
    if (location && location.trim()) {
      whereClauses.push('j.location LIKE ?');
      params.push(`%${location.trim()}%`);
    }

    // Filter by jobType (FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT)
    if (jobType && jobType.trim()) {
      whereClauses.push('j.job_type = ?');
      params.push(jobType.trim().toUpperCase());
    }

    // Filter by workMode (REMOTE, HYBRID, ONSITE)
    if (workMode && workMode.trim()) {
      whereClauses.push('j.work_mode = ?');
      params.push(workMode.trim().toUpperCase());
    }

    // Filter by experience
    if (experience && experience.trim()) {
      whereClauses.push('j.experience_required LIKE ?');
      params.push(`%${experience.trim()}%`);
    }

    // Filter by minSalary
    if (minSalary !== undefined && minSalary !== null && !isNaN(minSalary) && minSalary !== '') {
      whereClauses.push('j.max_salary >= ?');
      params.push(Number(minSalary));
    }

    // Filter by maxSalary
    if (maxSalary !== undefined && maxSalary !== null && !isNaN(maxSalary) && maxSalary !== '') {
      whereClauses.push('j.min_salary <= ?');
      params.push(Number(maxSalary));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. Total count query
    const countSql = `SELECT COUNT(*) AS total FROM jobs j ${whereSql}`;
    const [countResult] = await pool.execute(countSql, params);
    const totalJobs = countResult[0]?.total || 0;

    // 2. Pagination calculation
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offsetNum = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(totalJobs / limitNum) || 1;

    // 3. Data query
    // Note: in mysql2 prepared statements, LIMIT and OFFSET can be passed as numbers
    const dataSql = `
      SELECT 
        j.id,
        j.recruiter_id,
        j.title,
        j.company_name,
        j.description,
        j.required_skills,
        j.location,
        j.job_type,
        j.work_mode,
        j.experience_required,
        j.min_salary,
        j.max_salary,
        j.deadline,
        j.status,
        j.created_at,
        j.updated_at
      FROM jobs j
      ${whereSql}
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(dataSql, [...params, String(limitNum), String(offsetNum)]);

    return {
      jobs: rows,
      pagination: {
        totalJobs,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    };
  }

  /**
   * Find single job by ID
   * @param {number|string} id 
   */
  static async findById(id) {
    const query = `
      SELECT 
        j.id,
        j.recruiter_id,
        j.title,
        j.company_name,
        j.description,
        j.required_skills,
        j.location,
        j.job_type,
        j.work_mode,
        j.experience_required,
        j.min_salary,
        j.max_salary,
        j.deadline,
        j.status,
        j.created_at,
        j.updated_at,
        u.name AS recruiter_name,
        u.email AS recruiter_email
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      WHERE j.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Create a new job listing for a recruiter
   */
  static async createJob({
    recruiterId,
    title,
    company_name,
    description,
    required_skills,
    location,
    job_type,
    work_mode,
    experience_required,
    min_salary,
    max_salary,
    deadline,
    status = 'ACTIVE'
  }) {
    const query = `
      INSERT INTO jobs (
        recruiter_id, title, company_name, description, required_skills,
        location, job_type, work_mode, experience_required, min_salary,
        max_salary, deadline, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      recruiterId,
      title.trim(),
      company_name.trim(),
      description.trim(),
      required_skills ? required_skills.trim() : null,
      location.trim(),
      job_type.toUpperCase(),
      work_mode.toUpperCase(),
      experience_required ? experience_required.trim() : null,
      min_salary !== undefined && min_salary !== null && min_salary !== '' ? Number(min_salary) : null,
      max_salary !== undefined && max_salary !== null && max_salary !== '' ? Number(max_salary) : null,
      deadline || null,
      status || 'ACTIVE'
    ];

    const [result] = await pool.execute(query, values);
    return this.findById(result.insertId);
  }

  /**
   * Find all jobs belonging to a specific recruiter with application counts
   */
  static async findByRecruiterId(recruiterId) {
    const query = `
      SELECT 
        j.id,
        j.recruiter_id,
        j.title,
        j.company_name,
        j.description,
        j.required_skills,
        j.location,
        j.job_type,
        j.work_mode,
        j.experience_required,
        j.min_salary,
        j.max_salary,
        j.deadline,
        j.status,
        j.created_at,
        j.updated_at,
        COUNT(a.id) AS application_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.recruiter_id = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;
    const [rows] = await pool.execute(query, [recruiterId]);
    return rows;
  }

  /**
   * Find single job by ID verifying recruiter ownership
   */
  static async findByIdAndRecruiter(id, recruiterId) {
    const query = `
      SELECT 
        j.id,
        j.recruiter_id,
        j.title,
        j.company_name,
        j.description,
        j.required_skills,
        j.location,
        j.job_type,
        j.work_mode,
        j.experience_required,
        j.min_salary,
        j.max_salary,
        j.deadline,
        j.status,
        j.created_at,
        j.updated_at,
        COUNT(a.id) AS application_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.id = ? AND j.recruiter_id = ?
      GROUP BY j.id
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id, recruiterId]);
    return rows[0] || null;
  }

  /**
   * Update job fields verifying recruiter ownership
   */
  static async updateJob(id, recruiterId, updateData) {
    const allowedFields = [
      'title', 'company_name', 'description', 'required_skills',
      'location', 'job_type', 'work_mode', 'experience_required',
      'min_salary', 'max_salary', 'deadline', 'status'
    ];

    const fields = [];
    const values = [];

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        let val = updateData[key];
        if (key === 'job_type' || key === 'work_mode' || key === 'status') {
          val = val ? val.toUpperCase() : val;
        } else if (key === 'min_salary' || key === 'max_salary') {
          val = val !== null && val !== '' && !isNaN(val) ? Number(val) : null;
        } else if (typeof val === 'string') {
          val = val.trim();
        }
        values.push(val);
      }
    }

    if (fields.length === 0) {
      return this.findByIdAndRecruiter(id, recruiterId);
    }

    values.push(id, recruiterId);
    const query = `
      UPDATE jobs 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND recruiter_id = ?
    `;

    const [result] = await pool.execute(query, values);
    if (result.affectedRows === 0) return null;
    return this.findByIdAndRecruiter(id, recruiterId);
  }

  /**
   * Set status to CLOSED for a job owned by recruiter
   */
  static async closeJob(id, recruiterId) {
    const query = `
      UPDATE jobs 
      SET status = 'CLOSED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND recruiter_id = ?
    `;
    const [result] = await pool.execute(query, [id, recruiterId]);
    return result.affectedRows > 0;
  }

  /**
   * Delete a job owned by recruiter
   */
  static async deleteJob(id, recruiterId) {
    const query = `DELETE FROM jobs WHERE id = ? AND recruiter_id = ?`;
    const [result] = await pool.execute(query, [id, recruiterId]);
    return result.affectedRows > 0;
  }

  /**
   * Aggregate job counts for a recruiter
   */
  static async getRecruiterJobStats(recruiterId) {
    const query = `
      SELECT 
        COUNT(*) AS total_jobs,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_jobs,
        SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) AS closed_jobs
      FROM jobs
      WHERE recruiter_id = ?
    `;
    const [rows] = await pool.execute(query, [recruiterId]);
    return {
      totalJobs: Number(rows[0]?.total_jobs || 0),
      activeJobs: Number(rows[0]?.active_jobs || 0),
      closedJobs: Number(rows[0]?.closed_jobs || 0)
    };
  }
}

module.exports = JobModel;

