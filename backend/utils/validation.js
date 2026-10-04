/**
 * Email format validation regex
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate registration input
 */
const validateRegistration = ({ name, email, password, role, phone }) => {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required');
  } else if (name.trim().length < 2 || name.trim().length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email address is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  const validRoles = ['CANDIDATE', 'RECRUITER'];
  if (!role || !validRoles.includes(role.toUpperCase())) {
    errors.push('Role must be either CANDIDATE or RECRUITER');
  }

  if (phone && phone.trim().length > 0) {
    const cleanPhone = phone.trim();
    // Allow digits, spaces, plus, hyphens, parentheses (7 to 20 chars)
    const phoneRegex = /^[\d\s+\-()]{7,20}$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Please enter a valid phone number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate login input
 */
const validateLogin = ({ email, password }) => {
  const errors = [];

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email address is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  validateRegistration,
  validateLogin
};
