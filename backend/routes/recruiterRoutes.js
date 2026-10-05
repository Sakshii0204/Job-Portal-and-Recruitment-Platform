const express = require('express');
const router = express.Router();
const { recruiterTest } = require('../controllers/testController');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  closeJob,
  deleteJob
} = require('../controllers/recruiterJobController');
const {
  getJobApplicants,
  getApplicationDetails,
  updateApplicationStatus
} = require('../controllers/recruiterApplicationController');
const { getDashboardStats } = require('../controllers/recruiterDashboardController');

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All recruiter routes require authentication & RECRUITER role
router.use(authenticateToken);
router.use(requireRole('RECRUITER'));

// GET /api/recruiter/test
router.get('/test', recruiterTest);

// Recruiter Dashboard Analytics
// GET /api/recruiter/dashboard/stats
router.get('/dashboard/stats', getDashboardStats);

// Job Management
// POST /api/recruiter/jobs (Create job)
router.post('/jobs', createJob);

// GET /api/recruiter/jobs (List my jobs)
router.get('/jobs', getJobs);

// GET /api/recruiter/jobs/:id (Get single job details)
router.get('/jobs/:id', getJobById);

// PUT /api/recruiter/jobs/:id (Edit job)
router.put('/jobs/:id', updateJob);

// PUT /api/recruiter/jobs/:id/close (Close job)
router.put('/jobs/:id/close', closeJob);

// DELETE /api/recruiter/jobs/:id (Delete job)
router.delete('/jobs/:id', deleteJob);

// Applicant Review & Status Management
// GET /api/recruiter/jobs/:jobId/applications (View all applicants for a job)
router.get('/jobs/:jobId/applications', getJobApplicants);

// GET /api/recruiter/applications/:id (View detailed applicant profile & application)
router.get('/applications/:id', getApplicationDetails);

// PUT /api/recruiter/applications/:id/status (Shortlist, Reject, Accept application)
router.put('/applications/:id/status', updateApplicationStatus);

module.exports = router;
