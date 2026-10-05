const JobModel = require('../models/jobModel');
const { validateId } = require('../utils/paramValidation');

const VALID_JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];
const VALID_WORK_MODES = ['REMOTE', 'HYBRID', 'ONSITE'];
const VALID_STATUSES = ['ACTIVE', 'CLOSED'];

class RecruiterJobService {
  /**
   * Validate job payload
   */
  static validateJobData(data, isUpdate = false) {
    const errors = [];
    const {
      title,
      company_name,
      description,
      location,
      job_type,
      work_mode,
      min_salary,
      max_salary,
      deadline,
      status
    } = data;

    if (!isUpdate || title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        errors.push('Job title is required');
      } else if (title.trim().length < 3 || title.trim().length > 200) {
        errors.push('Job title must be between 3 and 200 characters');
      }
    }

    if (!isUpdate || company_name !== undefined) {
      if (!company_name || typeof company_name !== 'string' || !company_name.trim()) {
        errors.push('Company name is required');
      } else if (company_name.trim().length < 2 || company_name.trim().length > 200) {
        errors.push('Company name must be between 2 and 200 characters');
      }
    }

    if (!isUpdate || description !== undefined) {
      if (!description || typeof description !== 'string' || !description.trim()) {
        errors.push('Job description is required');
      } else if (description.trim().length < 10) {
        errors.push('Job description must be at least 10 characters long');
      }
    }

    if (!isUpdate || location !== undefined) {
      if (!location || typeof location !== 'string' || !location.trim()) {
        errors.push('Location is required');
      }
    }

    if (!isUpdate || job_type !== undefined) {
      if (!job_type || !VALID_JOB_TYPES.includes(job_type.toUpperCase())) {
        errors.push(`Job type must be one of: ${VALID_JOB_TYPES.join(', ')}`);
      }
    }

    if (!isUpdate || work_mode !== undefined) {
      if (!work_mode || !VALID_WORK_MODES.includes(work_mode.toUpperCase())) {
        errors.push(`Work mode must be one of: ${VALID_WORK_MODES.join(', ')}`);
      }
    }

    if (min_salary !== undefined && min_salary !== null && min_salary !== '') {
      const min = Number(min_salary);
      if (isNaN(min) || min < 0) {
        errors.push('Minimum salary cannot be negative');
      }
    }

    if (max_salary !== undefined && max_salary !== null && max_salary !== '') {
      const max = Number(max_salary);
      if (isNaN(max) || max < 0) {
        errors.push('Maximum salary cannot be negative');
      }
    }

    if (
      min_salary !== undefined && min_salary !== null && min_salary !== '' &&
      max_salary !== undefined && max_salary !== null && max_salary !== ''
    ) {
      if (Number(min_salary) > Number(max_salary)) {
        errors.push('Minimum salary cannot exceed maximum salary');
      }
    }

    if (deadline) {
      const parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        errors.push('Application deadline must be a valid date');
      } else if (!isUpdate) {
        // When creating, deadline should not be in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDeadline < today) {
          errors.push('Application deadline cannot be in the past');
        }
      }
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status.toUpperCase())) {
        errors.push(`Status must be either ACTIVE or CLOSED`);
      }
    }

    if (errors.length > 0) {
      const err = new Error(errors[0]);
      err.statusCode = 400;
      err.errors = errors;
      throw err;
    }
  }

  /**
   * Create a new job
   */
  static async createJob(recruiterId, data) {
    this.validateJobData(data, false);
    // Explicitly delete any client-sent recruiter_id / recruiterId to guarantee binding to verified JWT user
    const cleanData = { ...data };
    delete cleanData.recruiter_id;
    delete cleanData.recruiterId;

    return JobModel.createJob({
      ...cleanData,
      recruiterId
    });
  }

  /**
   * Get all jobs owned by recruiter
   */
  static async getRecruiterJobs(recruiterId) {
    return JobModel.findByRecruiterId(recruiterId);
  }

  /**
   * Get single job by ID verifying ownership
   */
  static async getJobById(jobId, recruiterId) {
    const validId = validateId(jobId, 'job ID');

    const job = await JobModel.findById(validId);
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    if (job.recruiter_id !== recruiterId) {
      const error = new Error('Forbidden: You do not have permission to view or manage this job');
      error.statusCode = 403;
      throw error;
    }

    return JobModel.findByIdAndRecruiter(validId, recruiterId);
  }

  /**
   * Edit job verifying ownership
   */
  static async updateJob(jobId, recruiterId, updateData) {
    // 1. Check existence and ownership
    await this.getJobById(jobId, recruiterId);

    // 2. Validate update fields
    this.validateJobData(updateData, true);

    // 3. Perform update
    const updated = await JobModel.updateJob(Number(jobId), recruiterId, updateData);
    return updated;
  }

  /**
   * Close job (soft close)
   */
  static async closeJob(jobId, recruiterId) {
    // Check existence and ownership
    await this.getJobById(jobId, recruiterId);

    const success = await JobModel.closeJob(Number(jobId), recruiterId);
    if (!success) {
      const error = new Error('Failed to close job');
      error.statusCode = 500;
      throw error;
    }
    return JobModel.findByIdAndRecruiter(Number(jobId), recruiterId);
  }

  /**
   * Delete job
   */
  static async deleteJob(jobId, recruiterId) {
    // Check existence and ownership
    await this.getJobById(jobId, recruiterId);

    const success = await JobModel.deleteJob(Number(jobId), recruiterId);
    if (!success) {
      const error = new Error('Failed to delete job');
      error.statusCode = 500;
      throw error;
    }
    return { id: Number(jobId), deleted: true };
  }
}

module.exports = RecruiterJobService;
