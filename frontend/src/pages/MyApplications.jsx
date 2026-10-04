import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../services/authService';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getMyApplications();
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-badge-pending';
      case 'SHORTLISTED':
        return 'status-badge-shortlisted';
      case 'ACCEPTED':
        return 'status-badge-accepted';
      case 'REJECTED':
        return 'status-badge-rejected';
      default:
        return 'status-badge-default';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="applications-header-bar">
        <div>
          <h2>My Job Applications</h2>
          <p className="text-muted">Track the status of all your submitted job applications</p>
        </div>
        <div className="header-actions-group">
          <Link to="/jobs" className="btn btn-primary btn-sm">
            Browse More Jobs
          </Link>
          <Link to="/candidate/dashboard" className="btn btn-outline btn-sm">
            Dashboard
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error">
          <span>{errorMsg}</span>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-icon">📄</div>
          <h3>You haven't applied to any jobs yet.</h3>
          <p className="text-muted">
            Explore available opportunities and submit your first application to jumpstart your career.
          </p>
          <Link to="/jobs" className="btn btn-primary mt-sm">
            Find Jobs to Apply
          </Link>
        </div>
      ) : (
        <div className="applications-list-container">
          <div className="applications-count-summary">
            <span>You have submitted <strong>{applications.length}</strong> application(s).</span>
          </div>

          <div className="applications-grid">
            {applications.map((app) => (
              <div key={app.application_id} className="card application-item-card">
                <div className="app-item-header">
                  <div>
                    <span className="app-company-name">{app.company_name}</span>
                    <h3 className="app-job-title">{app.job_title}</h3>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(app.application_status)}`}>
                    ● {app.application_status}
                  </span>
                </div>

                <div className="app-meta-row">
                  <span>📍 {app.location}</span>
                  <span>💼 {app.job_type.replace('_', ' ')}</span>
                  <span>🏢 {app.work_mode}</span>
                  <span>📅 Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                </div>

                {app.cover_letter && (
                  <div className="app-cover-letter-preview">
                    <strong>Cover Letter:</strong>
                    <p>
                      {app.cover_letter.length > 150
                        ? `${app.cover_letter.substring(0, 150)}...`
                        : app.cover_letter}
                    </p>
                  </div>
                )}

                <div className="app-item-footer">
                  {app.resume_url ? (
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="link-subtle"
                    >
                      📎 Attached Resume URL
                    </a>
                  ) : (
                    <span className="text-muted text-sm">No resume link provided</span>
                  )}

                  <Link to={`/jobs/${app.job_id}`} className="btn btn-outline btn-sm">
                    View Job Posting →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
