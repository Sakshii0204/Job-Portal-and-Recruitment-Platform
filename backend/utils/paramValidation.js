/**
 * Parameter and ID validation utilities
 */

/**
 * Validates and converts an ID parameter to positive integer.
 * Returns positive integer or throws a 400 error.
 */
const validateId = (id, paramName = 'ID') => {
  if (id === undefined || id === null || id === '') {
    const error = new Error(`${paramName} is required`);
    error.statusCode = 400;
    throw error;
  }

  // Reject non-numeric strings or negative/floating values
  const stringId = String(id).trim();
  if (!/^\d+$/.test(stringId)) {
    const error = new Error(`Invalid ${paramName}: must be a positive integer`);
    error.statusCode = 400;
    throw error;
  }

  const parsed = parseInt(stringId, 10);
  if (parsed <= 0 || parsed > 2147483647) {
    const error = new Error(`Invalid ${paramName}: out of acceptable range`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

/**
 * Validates pagination parameters: page and limit.
 * Enforces minimum 1, and max limit cap.
 */
const validatePagination = (query) => {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined && query.page !== null && query.page !== '') {
    const parsedPage = parseInt(query.page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      page = 1;
    } else if (parsedPage > 100000) {
      page = 100000;
    } else {
      page = parsedPage;
    }
  }

  if (query.limit !== undefined && query.limit !== null && query.limit !== '') {
    const parsedLimit = parseInt(query.limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      limit = 10;
    } else if (parsedLimit > 50) {
      // Sensible maximum cap to prevent DoS via massive page loads
      limit = 50;
    } else {
      limit = parsedLimit;
    }
  }

  return { page, limit };
};

/**
 * Sanitizes search and query text to prevent runaway lengths
 */
const sanitizeQueryString = (str, maxLength = 100) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
};

module.exports = {
  validateId,
  validatePagination,
  sanitizeQueryString
};
