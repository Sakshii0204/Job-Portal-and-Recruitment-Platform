const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById } = require('../controllers/jobController');

// GET /api/jobs (Active jobs with search and filter)
router.get('/', getAllJobs);

// GET /api/jobs/:id (Job details)
router.get('/:id', getJobById);

module.exports = router;
