const JobModel = require('../models/jobModel');
const ApplicationModel = require('../models/applicationModel');

class RecruiterDashboardService {
  /**
   * Fetch complete dashboard statistics and overview for recruiter
   */
  static async getDashboardStats(recruiterId) {
    const [jobStats, appStats, recentJobs, recentApplications] = await Promise.all([
      JobModel.getRecruiterJobStats(recruiterId),
      ApplicationModel.getRecruiterApplicationStats(recruiterId),
      JobModel.findByRecruiterId(recruiterId),
      ApplicationModel.findRecentApplicationsByRecruiter(recruiterId, 5)
    ]);

    return {
      metrics: {
        totalJobs: jobStats.totalJobs,
        activeJobs: jobStats.activeJobs,
        closedJobs: jobStats.closedJobs,
        totalApplications: appStats.totalApplications,
        pending: appStats.pending,
        shortlisted: appStats.shortlisted,
        accepted: appStats.accepted,
        rejected: appStats.rejected
      },
      recentJobs: recentJobs.slice(0, 5),
      recentApplications
    };
  }
}

module.exports = RecruiterDashboardService;
