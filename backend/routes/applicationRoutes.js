const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  checkApplicationStatus
} = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All application routes require authentication & CANDIDATE role
router.use(authenticateToken);
router.use(requireRole('CANDIDATE'));

// POST /api/applications (Submit application)
router.post('/', createApplication);

// GET /api/applications/my (List all my applications)
router.get('/my', getMyApplications);

// GET /api/applications/my/:id (Get single application details)
router.get('/my/:id', getApplicationById);

// GET /api/applications/status/:jobId (Check if candidate applied)
router.get('/status/:jobId', checkApplicationStatus);

module.exports = router;
