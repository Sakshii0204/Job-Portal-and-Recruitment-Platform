const JobModel = require('../models/jobModel');

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
      maxSalary,
      page,
      limit
    } = query;

    const result = await JobModel.findAll({
      search,
      location,
      jobType,
      workMode,
      experience,
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
    if (!id || isNaN(id)) {
      const error = new Error('Invalid job ID');
      error.statusCode = 400;
      throw error;
    }

    const job = await JobModel.findById(Number(id));
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    return job;
  }
}

module.exports = JobService;
