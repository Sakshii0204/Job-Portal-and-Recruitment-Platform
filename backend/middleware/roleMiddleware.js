/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - e.g. 'CANDIDATE', 'RECRUITER'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User role could not be verified'
      });
    }

    const normalizedUserRole = req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s)`
      });
    }

    next();
  };
};

module.exports = {
  requireRole
};
