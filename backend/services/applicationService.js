const ApplicationModel = require('../models/applicationModel');
const JobModel = require('../models/jobModel');
const { validateId } = require('../utils/paramValidation');

const isValidUrl = (string) => {
  if (!string || typeof string !== 'string') return true;
  const trimmed = string.trim();
  if (trimmed === '') return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

class ApplicationService {
  /**
   * Submit a new job application
   */
  static async apply({ jobId, candidateId, coverLetter, resumeUrl }) {
    const validJobId = validateId(jobId, 'job ID');

    // 1. Verify job exists
    const job = await JobModel.findById(validJobId);
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify job is ACTIVE
    if (job.status !== 'ACTIVE') {
      const error = new Error('Applications for this job are currently closed');
      error.statusCode = 400;
      throw error;
    }

    // 3. Verify deadline has not passed
    if (job.deadline) {
      const deadlineDate = new Date(job.deadline);
      // Set to end of day for deadline
      deadlineDate.setHours(23, 59, 59, 999);
      if (deadlineDate < new Date()) {
        const error = new Error('The application deadline for this job has expired');
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Validate cover letter and resume
    if (coverLetter && coverLetter.length > 3000) {
      const error = new Error('Cover letter must not exceed 3000 characters');
      error.statusCode = 400;
      throw error;
    }

    if (resumeUrl && !isValidUrl(resumeUrl)) {
      const error = new Error('Resume URL must be a valid HTTP or HTTPS link');
      error.statusCode = 400;
      throw error;
    }

    // 5. Prevent duplicate applications
    const existing = await ApplicationModel.findByJobAndCandidate(Number(jobId), candidateId);
    if (existing) {
      const error = new Error('You have already applied for this job');
      error.statusCode = 409;
      throw error;
    }

    // 6. Create application
    const application = await ApplicationModel.create({
      jobId: Number(jobId),
      candidateId,
      coverLetter,
      resumeUrl
    });

    return application;
  }

  /**
   * Fetch all applications for current candidate
   */
  static async getMyApplications(candidateId) {
    const applications = await ApplicationModel.findCandidateApplications(candidateId);
    return applications;
  }

  /**
   * Fetch single application belonging to candidate
   */
  static async getApplicationById(id, candidateId) {
    const validId = validateId(id, 'application ID');

    const application = await ApplicationModel.findApplicationById(validId, candidateId);
    if (!application) {
      const error = new Error('Application not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    return application;
  }

  /**
   * Check if candidate applied to a specific job
   */
  static async checkAppliedStatus(jobId, candidateId) {
    if (!jobId || isNaN(jobId)) return false;
    const existing = await ApplicationModel.findByJobAndCandidate(Number(jobId), candidateId);
    return Boolean(existing);
  }
}

module.exports = ApplicationService;
