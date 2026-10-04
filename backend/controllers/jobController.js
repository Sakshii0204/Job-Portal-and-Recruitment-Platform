const JobService = require('../services/jobService');

/**
 * Get active jobs with search and filter
 * GET /api/jobs
 */
const getAllJobs = async (req, res, next) => {
  try {
    const data = await JobService.getJobs(req.query);
    res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      data: data.jobs,
      pagination: data.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single job details by ID
 * GET /api/jobs/:id
 */
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await JobService.getJobById(id);
    res.status(200).json({
      success: true,
      message: 'Job details fetched successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  getJobById
};
