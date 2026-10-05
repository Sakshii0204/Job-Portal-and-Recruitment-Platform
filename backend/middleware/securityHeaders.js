/**
 * Essential HTTP security headers middleware (inspired by Helmet)
 * Enhances response security without external dependencies.
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking via iframes
  res.setHeader('X-Frame-Options', 'DENY');

  // Basic XSS protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information sent in requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disallow DNS prefetching controls where not needed
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // Remove Express powered-by header to avoid information disclosure
  res.removeHeader('X-Powered-By');

  next();
};

module.exports = {
  securityHeaders
};
