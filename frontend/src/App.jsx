import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateProfile from './pages/CandidateProfile';
import MyApplications from './pages/MyApplications';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CreateJob from './pages/CreateJob';
import ManageJobs from './pages/ManageJobs';
import EditJob from './pages/EditJob';
import JobApplicants from './pages/JobApplicants';
import ApplicationReview from './pages/ApplicationReview';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Candidate Protected Routes */}
            <Route
              path="/candidate/dashboard"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/profile"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <CandidateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/applications"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Protected Routes */}
            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <ManageJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs/create"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <CreateJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <EditJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs/:jobId/applications"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <JobApplicants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/applications/:id"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <ApplicationReview />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
}


export default App;
