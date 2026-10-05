const ApplicationModel = require('../models/applicationModel');
const JobModel = require('../models/jobModel');

const ALLOWED_STATUSES = ['PENDING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];

class RecruiterApplicationService {
  /**
   * Fetch all applicants for a specific job owned by recruiter
   */
  static async getJobApplicants(jobId, recruiterId) {
    if (!jobId || isNaN(jobId)) {
      const error = new Error('Invalid job ID');
      error.statusCode = 400;
      throw error;
    }

    // 1. Verify job exists
    const job = await JobModel.findById(Number(jobId));
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify ownership
    if (job.recruiter_id !== recruiterId) {
      const error = new Error('Forbidden: You do not have permission to view applicants for this job');
      error.statusCode = 403;
      throw error;
    }

    // 3. Fetch applicants
    const applications = await ApplicationModel.findApplicationsByJobAndRecruiter(Number(jobId), recruiterId);
    return {
      job: {
        id: job.id,
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        status: job.status
      },
      applications
    };
  }

  /**
   * Fetch single applicant & application details verifying ownership
   */
  static async getApplicationDetails(applicationId, recruiterId) {
    if (!applicationId || isNaN(applicationId)) {
      const error = new Error('Invalid application ID');
      error.statusCode = 400;
      throw error;
    }

    const application = await ApplicationModel.findApplicationByIdAndRecruiter(Number(applicationId), recruiterId);
    if (!application) {
      // Check if application exists at all to return 403 vs 404
      const [rows] = await require('../config/db').pool.execute(
        'SELECT a.id, j.recruiter_id FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.id = ?',
        [applicationId]
      );
      if (rows.length > 0) {
        const error = new Error('Forbidden: This application belongs to another recruiter');
        error.statusCode = 403;
        throw error;
      }

      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    return application;
  }

  /**
   * Update application status (SHORTLISTED, REJECTED, ACCEPTED, PENDING)
   */
  static async updateApplicationStatus(applicationId, recruiterId, status) {
    if (!applicationId || isNaN(applicationId)) {
      const error = new Error('Invalid application ID');
      error.statusCode = 400;
      throw error;
    }

    if (!status || !ALLOWED_STATUSES.includes(status.toUpperCase())) {
      const error = new Error(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Verify ownership
    await this.getApplicationDetails(applicationId, recruiterId);

    // Update status
    const updated = await ApplicationModel.updateStatus(Number(applicationId), recruiterId, status);
    return updated;
  }
}

module.exports = RecruiterApplicationService;
