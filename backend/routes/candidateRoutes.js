const express = require('express');
const router = express.Router();
const { candidateTest } = require('../controllers/testController');
const { getProfile, updateProfile } = require('../controllers/candidateProfileController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All candidate routes require authentication & CANDIDATE role
router.use(authenticateToken);
router.use(requireRole('CANDIDATE'));

// GET /api/candidate/test
router.get('/test', candidateTest);

// Profile endpoints
// GET /api/candidate/profile
router.get('/profile', getProfile);

// PUT /api/candidate/profile
router.put('/profile', updateProfile);

module.exports = router;

