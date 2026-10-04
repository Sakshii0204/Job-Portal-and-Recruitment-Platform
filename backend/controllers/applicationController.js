const ApplicationService = require('../services/applicationService');

/**
 * Submit job application
 * POST /api/applications
 */
const createApplication = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const { job_id, cover_letter, resume_url } = req.body;

    const application = await ApplicationService.apply({
      jobId: job_id,
      candidateId,
      coverLetter: cover_letter,
      resumeUrl: resume_url
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications submitted by authenticated candidate
 * GET /api/applications/my
 */
const getMyApplications = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const applications = await ApplicationService.getMyApplications(candidateId);

    res.status(200).json({
      success: true,
      message: 'Candidate applications fetched successfully',
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single application by ID for authenticated candidate
 * GET /api/applications/my/:id
 */
const getApplicationById = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const { id } = req.params;

    const application = await ApplicationService.getApplicationById(id, candidateId);

    res.status(200).json({
      success: true,
      message: 'Application fetched successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if current candidate applied to a job
 * GET /api/applications/status/:jobId
 */
const checkApplicationStatus = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const { jobId } = req.params;

    const hasApplied = await ApplicationService.checkAppliedStatus(jobId, candidateId);

    res.status(200).json({
      success: true,
      hasApplied
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  checkApplicationStatus
};
