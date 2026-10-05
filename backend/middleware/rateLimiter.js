/**
 * In-memory IP rate limiter for authentication routes (login / register)
 * Protects against brute-force attacks without requiring Redis or extra external services.
 */
const rateLimitMap = new Map();

/**
 * Clean up expired rate limit entries periodically (every 5 minutes)
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Lightweight rate limit middleware factory
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (e.g. 15 * 60 * 1000 = 15 mins)
 * @param {number} options.max - Max number of requests allowed per window
 * @param {string} options.message - Error message returned when limit is exceeded
 */
const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' }) => {
  return (req, res, next) => {
    // In test environment, do not throttle automated test runners
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    let entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitMap.set(key, entry);
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds
      });
    }

    next();
  };
};

module.exports = {
  createRateLimiter
};
