import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  testCandidateEndpoint,
  getCandidateProfile,
  getMyApplications
} from '../services/authService';

const CandidateDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [profRes, appsRes] = await Promise.allSettled([
        getCandidateProfile(),
        getMyApplications()
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.success) {
        setProfile(profRes.value.data);
      }
      if (appsRes.status === 'fulfilled' && appsRes.value.success) {
        setApplications(appsRes.value.data || []);
      }
    } finally {
      setLoadingData(false);
    }
  };

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

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 30; // base from user creation
    let score = 25; // has name & email
    if (profile.phone) score += 15;
    if (profile.location) score += 15;
    if (profile.summary) score += 15;
    if (profile.skills) score += 15;
    if (profile.resume_url) score += 15;
    return Math.min(100, score);
  };

  const completionPct = calculateProfileCompletion();

  const pendingCount = applications.filter((a) => a.application_status === 'PENDING').length;
  const shortlistedCount = applications.filter(
    (a) => a.application_status === 'SHORTLISTED' || a.application_status === 'ACCEPTED'
  ).length;

  return (
    <div className="page-container dashboard-page">
      {/* Top Banner */}
      <div className="dashboard-header-card">
        <div className="user-intro">
          <div className="avatar-circle avatar-candidate">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p className="dashboard-sub">Candidate Workspace • Phase 2 Active</p>
          </div>
        </div>

        <div className="dashboard-top-actions">
          <Link to="/jobs" className="btn btn-primary btn-sm">
            Browse Jobs
          </Link>
          <Link to="/candidate/profile" className="btn btn-outline btn-sm">
            My Profile
          </Link>
          <Link to="/candidate/applications" className="btn btn-outline btn-sm">
            My Applications ({applications.length})
          </Link>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics-grid">
        <div className="card metric-card">
          <span className="metric-icon">📄</span>
          <div>
            <div className="metric-number">{applications.length}</div>
            <div className="metric-label">Total Applications</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">⏳</span>
          <div>
            <div className="metric-number">{pendingCount}</div>
            <div className="metric-label">In Review / Pending</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">⭐</span>
          <div>
            <div className="metric-number">{shortlistedCount}</div>
            <div className="metric-label">Shortlisted / Accepted</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">💼</span>
          <div>
            <div className="metric-number">Active</div>
            <div className="metric-label">Candidate Status</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Profile Summary & Completion */}
        <div className="dashboard-col-left">
          <div className="card profile-widget-card">
            <div className="card-header">
              <h3>Profile Completion</h3>
              <span className="badge-phase">{completionPct}% Complete</span>
            </div>

            <div className="completion-bar-wrapper">
              <div
                className="completion-bar-fill"
                style={{ width: `${completionPct}%` }}
              ></div>
            </div>

            <p className="text-muted text-sm mt-sm">
              {completionPct === 100
                ? 'Your profile is fully completed! Recruiters can view all your qualifications.'
                : 'Complete your location, summary, skills, and resume link to increase recruiter visibility.'}
            </p>

            <div className="profile-quick-details mt-sm">
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{profile?.location || 'Not added'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Resume:</span>
                <span className="detail-value">
                  {profile?.resume_url ? 'Attached' : 'Not added'}
                </span>
              </div>
            </div>

            <Link to="/candidate/profile" className="btn btn-outline btn-block btn-sm mt-sm">
              Edit Complete Profile →
            </Link>
          </div>

          {/* Phase 1 Verification Card (Preserved) */}
          <div className="card auth-verification-card mt-md">
            <div className="card-header">
              <h3>Authentication Profile</h3>
              <span className="role-pill role-candidate">Candidate</span>
            </div>
            <div className="profile-details-list">
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">#{user?.id}</span>
              </div>
            </div>

            <div className="auth-verification-box">
              <h4>Role Authorization Test</h4>
              <p className="text-muted text-sm">
                Verify JWT authorization on <code>/api/candidate/test</code>.
              </p>
              <button
                onClick={handleTestBackend}
                className="btn btn-outline btn-sm"
                disabled={testing}
              >
                {testing ? 'Verifying...' : 'Test Candidate Endpoint'}
              </button>

              {testResult && (
                <div className={`alert alert-${testResult.type} mt-sm`}>
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Applications & Quick Actions */}
        <div className="dashboard-col-right">
          <div className="card recent-apps-card">
            <div className="card-header">
              <h3>Recent Applications</h3>
              <Link to="/candidate/applications" className="link-subtle">
                View All ({applications.length}) →
              </Link>
            </div>

            {loadingData ? (
              <div className="loading-container" style={{ minHeight: '150px' }}>
                <div className="spinner"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-mini-state">
                <p className="text-muted">You haven't submitted any job applications yet.</p>
                <Link to="/jobs" className="btn btn-primary btn-sm mt-sm">
                  Browse Active Jobs
                </Link>
              </div>
            ) : (
              <div className="recent-apps-list">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.application_id} className="recent-app-item">
                    <div className="recent-app-info">
                      <strong>{app.job_title}</strong>
                      <span className="text-muted text-sm">
                        {app.company_name} • {app.location}
                      </span>
                    </div>
                    <div className="recent-app-status">
                      <span
                        className={`status-badge status-badge-${app.application_status.toLowerCase()}`}
                      >
                        {app.application_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card action-hub-card mt-md">
            <div className="card-header">
              <h3>Candidate Action Hub</h3>
            </div>
            <div className="hub-grid">
              <Link to="/jobs" className="hub-action-box">
                <span className="hub-icon">🔍</span>
                <strong>Search &amp; Filter Jobs</strong>
                <span>Find full-time, remote, or internship roles</span>
              </Link>

              <Link to="/candidate/profile" className="hub-action-box">
                <span className="hub-icon">👤</span>
                <strong>Update Profile &amp; Resume</strong>
                <span>Keep your skills and links current</span>
              </Link>

              <Link to="/candidate/applications" className="hub-action-box">
                <span className="hub-icon">📋</span>
                <strong>Track Application Status</strong>
                <span>Monitor review status from hiring recruiters</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
