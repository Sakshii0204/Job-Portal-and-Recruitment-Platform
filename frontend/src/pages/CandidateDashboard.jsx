import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testCandidateEndpoint } from '../services/authService';

const CandidateDashboard = () => {
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
      const res = await testCandidateEndpoint();
      setTestResult({
        type: 'success',
        message: res.message || 'Candidate endpoint authorization verified successfully!'
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
      <div className="dashboard-header-card">
        <div className="user-intro">
          <div className="avatar-circle avatar-candidate">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p className="dashboard-sub">Candidate Workspace • Phase 1 Verified</p>
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
        {/* User Profile Summary Card */}
        <div className="card profile-card">
          <div className="card-header">
            <h3>Authentication Profile</h3>
            <span className="role-pill role-candidate">Candidate</span>
          </div>
          <div className="profile-details-list">
            <div className="detail-item">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value">{user?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">Candidate</span>
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
              <span className="detail-label">User ID:</span>
              <span className="detail-value">#{user?.id}</span>
            </div>
          </div>

          <div className="auth-verification-box">
            <h4>Backend Role Authorization Check</h4>
            <p className="text-muted">
              Verify that your JWT is accepted by the candidate-protected endpoint <code>/api/candidate/test</code>.
            </p>
            <button
              onClick={handleTestBackend}
              className="btn btn-outline btn-sm"
              disabled={testing}
            >
              {testing ? 'Verifying...' : 'Test Candidate Authorization Endpoint'}
            </button>

            {testResult && (
              <div className={`alert alert-${testResult.type} mt-sm`}>
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Phase 2 Placeholder Card */}
        <div className="card roadmap-card">
          <div className="card-header">
            <h3>Upcoming Candidate Features</h3>
            <span className="badge-roadmap">Roadmap</span>
          </div>
          <div className="placeholder-content">
            <div className="placeholder-illustration">🔍 📄 💼</div>
            <h4>Candidate features will be added in Phase 2.</h4>
            <p className="text-muted">
              The foundation and authentication setup is active and secure. In Phase 2, this portal will include:
            </p>
            <ul className="placeholder-list">
              <li>Comprehensive candidate profile management &amp; resume upload</li>
              <li>Live job search and filtering by category, location, and salary</li>
              <li>One-click job application submission and status tracking</li>
              <li>Real-time application progress notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
