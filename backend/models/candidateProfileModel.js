const { pool } = require('../config/db');

class CandidateProfileModel {
  /**
   * Find profile by user ID including base user info (name, email, phone)
   * @param {number|string} userId 
   * @returns {Object|null}
   */
  static async findByUserId(userId) {
    const query = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.role,
        cp.id AS profile_id,
        cp.location,
        cp.summary,
        cp.skills,
        cp.education,
        cp.experience,
        cp.resume_url,
        cp.linkedin_url,
        cp.github_url,
        cp.created_at,
        cp.updated_at
      FROM users u
      LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
      WHERE u.id = ? AND u.role = 'CANDIDATE'
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows[0] || null;
  }

  /**
   * Upsert candidate profile
   * @param {number|string} userId 
   * @param {Object} profileData 
   * @returns {Object} updated profile
   */
  static async upsertProfile(userId, { location, summary, skills, education, experience, resume_url, linkedin_url, github_url }) {
    const query = `
      INSERT INTO candidate_profiles 
        (user_id, location, summary, skills, education, experience, resume_url, linkedin_url, github_url)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        location = VALUES(location),
        summary = VALUES(summary),
        skills = VALUES(skills),
        education = VALUES(education),
        experience = VALUES(experience),
        resume_url = VALUES(resume_url),
        linkedin_url = VALUES(linkedin_url),
        github_url = VALUES(github_url),
        updated_at = CURRENT_TIMESTAMP
    `;
    const values = [
      userId,
      location || null,
      summary || null,
      skills || null,
      education || null,
      experience || null,
      resume_url || null,
      linkedin_url || null,
      github_url || null
    ];

    await pool.execute(query, values);
    return this.findByUserId(userId);
  }

  /**
   * Optionally update name or phone on users table
   */
  static async updateUserBaseInfo(userId, { name, phone }) {
    if (!name && phone === undefined) return;
    const fields = [];
    const values = [];

    if (name) {
      fields.push('name = ?');
      values.push(name.trim());
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone ? phone.trim() : null);
    }
    values.push(userId);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);
  }
}

module.exports = CandidateProfileModel;
