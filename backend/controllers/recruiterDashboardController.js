const RecruiterDashboardService = require('../services/recruiterDashboardService');

/**
 * Get recruiter dashboard analytics and overview
 * GET /api/recruiter/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const stats = await RecruiterDashboardService.getDashboardStats(recruiterId);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
