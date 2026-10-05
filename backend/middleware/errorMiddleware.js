/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // Sanitize internal database/driver error leaks
  if (err.code && (err.code.startsWith('ER_') || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED')) {
    console.error(`[Database Error] ${req.method} ${req.originalUrl}:`, err.code, err.message);
    statusCode = 500;
    message = 'A database error occurred. Please try again later.';
  } else {
    console.error(`[Error] ${req.method} ${req.originalUrl} -`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
