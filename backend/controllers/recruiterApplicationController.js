const RecruiterApplicationService = require('../services/recruiterApplicationService');

/**
 * Get all applicants for a specific job owned by recruiter
 * GET /api/recruiter/jobs/:jobId/applications
 */
const getJobApplicants = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;
    const result = await RecruiterApplicationService.getJobApplicants(jobId, recruiterId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed application and candidate profile info
 * GET /api/recruiter/applications/:id
 */
const getApplicationDetails = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const { id } = req.params;
    const application = await RecruiterApplicationService.getApplicationDetails(id, recruiterId);
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status (SHORTLISTED, REJECTED, ACCEPTED, PENDING)
 * PUT /api/recruiter/applications/:id/status
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;
    const updated = await RecruiterApplicationService.updateApplicationStatus(id, recruiterId, status);
    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobApplicants,
  getApplicationDetails,
  updateApplicationStatus
};
