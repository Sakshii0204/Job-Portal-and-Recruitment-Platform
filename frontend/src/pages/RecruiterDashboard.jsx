import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecruiterStats, testRecruiterEndpoint } from '../services/authService';

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getRecruiterStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load recruiter analytics');
    } finally {
      setLoading(false);
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

  const metrics = stats?.metrics || {
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    pending: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0
  };

  return (
    <div className="page-container dashboard-page">
      {/* Top Banner */}
      <div className="dashboard-header-card recruiter-accent">
        <div className="user-intro">
          <div className="avatar-circle avatar-recruiter">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
          </div>
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p className="dashboard-sub">Recruiter Workspace • Phase 3 Active</p>
          </div>
        </div>

        <div className="dashboard-top-actions">
          <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm">
            + Post New Job
          </Link>
          <Link to="/recruiter/jobs" className="btn btn-outline btn-sm">
            Manage Jobs
          </Link>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics Row: Job Postings */}
      <div className="metrics-group-title">
        <h3>Job Postings Overview</h3>
      </div>
      <div className="dashboard-metrics-grid">
        <div className="card metric-card">
          <span className="metric-icon">💼</span>
          <div>
            <div className="metric-number">{metrics.totalJobs}</div>
            <div className="metric-label">Total Jobs Posted</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">🟢</span>
          <div>
            <div className="metric-number text-success">{metrics.activeJobs}</div>
            <div className="metric-label">Active Openings</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">🔒</span>
          <div>
            <div className="metric-number text-muted">{metrics.closedJobs}</div>
            <div className="metric-label">Closed Openings</div>
          </div>
        </div>
      </div>

      {/* Metrics Row: Applications Received */}
      <div className="metrics-group-title mt-md">
        <h3>Candidate Applications Overview</h3>
      </div>
      <div className="dashboard-metrics-grid">
        <div className="card metric-card">
          <span className="metric-icon">📄</span>
          <div>
            <div className="metric-number">{metrics.totalApplications}</div>
            <div className="metric-label">Total Received</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">⏳</span>
          <div>
            <div className="metric-number text-warning">{metrics.pending}</div>
            <div className="metric-label">Pending Review</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">⭐</span>
          <div>
            <div className="metric-number text-primary">{metrics.shortlisted}</div>
            <div className="metric-label">Shortlisted Candidates</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">✅</span>
          <div>
            <div className="metric-number text-success">{metrics.accepted}</div>
            <div className="metric-label">Hired / Accepted</div>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-icon">❌</span>
          <div>
            <div className="metric-number text-danger">{metrics.rejected}</div>
            <div className="metric-label">Rejected</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid mt-md">
        {/* Left Column: Recent Jobs */}
        <div className="card">
          <div className="card-header">
            <h3>Your Recent Job Postings</h3>
            <Link to="/recruiter/jobs" className="link-subtle">
              View All ({metrics.totalJobs}) →
            </Link>
          </div>

          {loading ? (
            <div className="loading-container" style={{ minHeight: '140px' }}>
              <div className="spinner"></div>
            </div>
          ) : !stats?.recentJobs || stats.recentJobs.length === 0 ? (
            <div className="empty-mini-state">
              <p className="text-muted">You haven't posted any jobs yet.</p>
              <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm mt-sm">
                Create First Job
              </Link>
            </div>
          ) : (
            <div className="recent-apps-list">
              {stats.recentJobs.map((j) => (
                <div key={j.id} className="recent-app-item">
                  <div className="recent-app-info">
                    <strong>{j.title}</strong>
                    <span className="text-muted text-sm">
                      {j.company_name} • {j.location} • {j.application_count || 0} applicant(s)
                    </span>
                  </div>
                  <div className="flex-row-gap">
                    <span className={`pill-badge badge-${j.work_mode ? j.work_mode.toLowerCase() : 'onsite'}`}>
                      {j.work_mode}
                    </span>
                    <span className={`status-badge ${j.status === 'ACTIVE' ? 'status-badge-accepted' : 'status-badge-rejected'}`}>
                      {j.status}
                    </span>
                    <Link to={`/recruiter/jobs/${j.id}/applications`} className="btn btn-outline btn-sm">
                      Applicants ({j.application_count || 0})
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Applications Received */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Applications Received</h3>
          </div>

          {loading ? (
            <div className="loading-container" style={{ minHeight: '140px' }}>
              <div className="spinner"></div>
            </div>
          ) : !stats?.recentApplications || stats.recentApplications.length === 0 ? (
            <div className="empty-mini-state">
              <p className="text-muted">No applications received yet.</p>
            </div>
          ) : (
            <div className="recent-apps-list">
              {stats.recentApplications.map((app) => (
                <div key={app.application_id} className="recent-app-item">
                  <div className="recent-app-info">
                    <strong>{app.candidate_name}</strong>
                    <span className="text-muted text-sm">
                      Applied for {app.job_title} • {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex-row-gap">
                    <span className={`status-badge status-badge-${app.application_status.toLowerCase()}`}>
                      {app.application_status}
                    </span>
                    <Link to={`/recruiter/applications/${app.application_id}`} className="btn btn-primary btn-sm">
                      Review →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Role Authorization Verification Tool */}
          <div className="auth-verification-box mt-md">
            <h4>Recruiter Authorization Verification</h4>
            <p className="text-muted text-sm">
              Confirm your verified recruiter token against <code>/api/recruiter/test</code>.
            </p>
            <button
              onClick={handleTestBackend}
              className="btn btn-outline btn-sm"
              disabled={testing}
            >
              {testing ? 'Verifying...' : 'Test Recruiter Endpoint'}
            </button>
            {testResult && (
              <div className={`alert alert-${testResult.type} mt-sm`}>
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
