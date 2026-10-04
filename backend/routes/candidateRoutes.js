const express = require('express');
const router = express.Router();
const { candidateTest } = require('../controllers/testController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All candidate routes require authentication & CANDIDATE role
router.use(authenticateToken);
router.use(requireRole('CANDIDATE'));

// GET /api/candidate/test
router.get('/test', candidateTest);

module.exports = router;
