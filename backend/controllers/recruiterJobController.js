const RecruiterJobService = require('../services/recruiterJobService');

/**
 * Create a new job
 * POST /api/recruiter/jobs
 */
const createJob = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const job = await RecruiterJobService.createJob(recruiterId, req.body);
    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all jobs owned by logged-in recruiter
 * GET /api/recruiter/jobs
 */
const getJobs = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const jobs = await RecruiterJobService.getRecruiterJobs(recruiterId);
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single job by ID owned by recruiter
 * GET /api/recruiter/jobs/:id
 */
const getJobById = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const { id } = req.params;
    const job = await RecruiterJobService.getJobById(id, recruiterId);
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update job details
 * PUT /api/recruiter/jobs/:id
 */
const updateJob = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const { id } = req.params;
    const updated = await RecruiterJobService.updateJob(id, recruiterId, req.body);
    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft close a job
 * PUT /api/recruiter/jobs/:id/close
 */
const closeJob = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const { id } = req.params;
    const closed = await RecruiterJobService.closeJob(id, recruiterId);
    res.status(200).json({
      success: true,
      message: 'Job closed successfully. No new applications will be accepted.',
      data: closed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a job
 * DELETE /api/recruiter/jobs/:id
 */
const deleteJob = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const { id } = req.params;
    const result = await RecruiterJobService.deleteJob(id, recruiterId);
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  closeJob,
  deleteJob
};
