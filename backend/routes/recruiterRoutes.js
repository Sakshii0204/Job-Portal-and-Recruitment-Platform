const express = require('express');
const router = express.Router();
const { recruiterTest } = require('../controllers/testController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All recruiter routes require authentication & RECRUITER role
router.use(authenticateToken);
router.use(requireRole('RECRUITER'));

// GET /api/recruiter/test
router.get('/test', recruiterTest);

module.exports = router;
