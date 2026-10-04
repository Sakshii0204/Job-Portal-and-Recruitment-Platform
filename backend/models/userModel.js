const { pool } = require('../config/db');

class UserModel {
  /**
   * Find user by email (includes password hash for login verification)
   * @param {string} email 
   * @returns {Object|null} user record
   */
  static async findByEmail(email) {
    const query = 'SELECT id, name, email, password, role, phone, created_at, updated_at FROM users WHERE email = ? LIMIT 1';
    const [rows] = await pool.execute(query, [email.trim().toLowerCase()]);
    return rows[0] || null;
  }

  /**
   * Find safe user by ID (excludes password)
   * @param {number|string} id 
   * @returns {Object|null} safe user record
   */
  static async findById(id) {
    const query = 'SELECT id, name, email, role, phone, created_at, updated_at FROM users WHERE id = ? LIMIT 1';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Insert new user record
   * @param {Object} userData 
   * @returns {Object} created user with inserted id
   */
  static async createUser({ name, email, password, role, phone }) {
    const query = `
      INSERT INTO users (name, email, password, role, phone)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      name.trim(),
      email.trim().toLowerCase(),
      password,
      role.toUpperCase(),
      phone ? phone.trim() : null
    ];

    const [result] = await pool.execute(query, values);
    return {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.toUpperCase(),
      phone: phone ? phone.trim() : null
    };
  }
}

module.exports = UserModel;
