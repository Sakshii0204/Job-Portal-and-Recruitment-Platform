import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testRecruiterEndpoint } from '../services/authService';

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTestBackend = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testRecruiterEndpoint();
      setTestResult({
        type: 'success',
        message: res.message || 'Recruiter endpoint authorization verified successfully!'
      });
    } catch (err) {
      setTestResult({
        type: 'error',
        message: err.response?.data?.message || 'Authorization check failed.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="page-container dashboard-page">
      <div className="dashboard-header-card recruiter-accent">
        <div className="user-intro">
          <div className="avatar-circle avatar-recruiter">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
          </div>
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p className="dashboard-sub">Recruiter Workspace • Phase 1 Verified</p>
          </div>
        </div>

        <div className="dashboard-top-actions">
          <button onClick={() => window.location.reload()} className="btn btn-outline btn-sm">
            Dashboard
          </button>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recruiter Profile Summary Card */}
        <div className="card profile-card">
          <div className="card-header">
            <h3>Recruiter Authentication Profile</h3>
            <span className="role-pill role-recruiter">Recruiter</span>
          </div>
          <div className="profile-details-list">
            <div className="detail-item">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value">{user?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">Recruiter</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{user.phone}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Recruiter ID:</span>
              <span className="detail-value">#{user?.id}</span>
            </div>
          </div>

          <div className="auth-verification-box">
            <h4>Backend Role Authorization Check</h4>
            <p className="text-muted">
              Verify that your JWT is accepted by the recruiter-protected endpoint <code>/api/recruiter/test</code>.
            </p>
            <button
              onClick={handleTestBackend}
              className="btn btn-outline btn-sm"
              disabled={testing}
            >
              {testing ? 'Verifying...' : 'Test Recruiter Authorization Endpoint'}
            </button>

            {testResult && (
              <div className={`alert alert-${testResult.type} mt-sm`}>
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Phase 3 Placeholder Card */}
        <div className="card roadmap-card">
          <div className="card-header">
            <h3>Upcoming Recruiter Features</h3>
            <span className="badge-roadmap">Roadmap</span>
          </div>
          <div className="placeholder-content">
            <div className="placeholder-illustration">🏢 📊 👥</div>
            <h4>Recruiter features will be added in Phase 3.</h4>
            <p className="text-muted">
              The foundation and authentication setup is active and secure. In Phase 3, this recruiter workspace will include:
            </p>
            <ul className="placeholder-list">
              <li>Create and manage job postings with custom requirements</li>
              <li>View and review candidate applications and resumes</li>
              <li>Update application status (Reviewing, Shortlisted, Rejected)</li>
              <li>Recruitment pipeline analytics and hiring metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
