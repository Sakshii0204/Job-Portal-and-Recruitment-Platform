const JobModel = require('../models/jobModel');
const { validateId, validatePagination, sanitizeQueryString } = require('../utils/paramValidation');

class JobService {
  /**
   * Fetch active jobs matching filters and search criteria
   */
  static async getJobs(query) {
    const {
      search,
      location,
      jobType,
      workMode,
      experience,
      minSalary,
      maxSalary
    } = query;

    // Validate and cap pagination values safely
    const { page, limit } = validatePagination(query);

    const result = await JobModel.findAll({
      search: sanitizeQueryString(search, 100),
      location: sanitizeQueryString(location, 100),
      jobType: sanitizeQueryString(jobType, 50),
      workMode: sanitizeQueryString(workMode, 50),
      experience: sanitizeQueryString(experience, 50),
      minSalary,
      maxSalary,
      page,
      limit
    });

    return result;
  }

  /**
   * Fetch single job by ID
   */
  static async getJobById(id) {
    const validId = validateId(id, 'job ID');

    const job = await JobModel.findById(validId);
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    return job;
  }
}

module.exports = JobService;
