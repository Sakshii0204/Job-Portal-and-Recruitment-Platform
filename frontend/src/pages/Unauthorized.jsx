import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { role, isAuthenticated } = useAuth();
  const dashboardPath = role === 'RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard';

  return (
    <div className="status-page-container">
      <div className="status-card">
        <div className="status-icon warning-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1>403 — Access Denied</h1>
        <p>
          You do not have the required permissions to view this resource.
          {isAuthenticated && (
            <span> Your current account role is <strong>{role}</strong>.</span>
          )}
        </p>

        <div className="status-actions">
          {isAuthenticated ? (
            <Link to={dashboardPath} className="btn btn-primary">
              Return to Your Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign In with Authorized Account
            </Link>
          )}
          <Link to="/" className="btn btn-outline">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
