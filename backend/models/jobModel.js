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
}

module.exports = JobModel;
