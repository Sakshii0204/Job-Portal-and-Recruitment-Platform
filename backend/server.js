const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { testConnection } = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal and Recruitment Platform API is active',
    version: '1.0.0',
    phase: 'Phase 2 - Candidate Module'
  });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);


// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting Job Portal Backend Server...');
  console.log('----------------------------------------------------');
  
  // Test DB connection
  await testConnection();

  app.listen(PORT, () => {
    console.log(` Server listening on http://localhost:${PORT}`);
    console.log(` Health check available at http://localhost:${PORT}/api/health`);
    console.log('----------------------------------------------------');
  });
};

startServer();

module.exports = app;
