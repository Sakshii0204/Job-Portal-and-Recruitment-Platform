const jwt = require('jsonwebtoken');

/**
 * Generate a JSON Web Token
 * @param {Object} payload - { id, role, email }
 * @returns {string} signed JWT
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'phase1_default_dev_jwt_secret_key_123!';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = {
  generateToken
};
