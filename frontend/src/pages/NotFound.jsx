import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="status-page-container">
      <div className="status-card">
        <div className="status-icon notfound-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        <h1>404 — Page Not Found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>

        <div className="status-actions">
          <Link to="/" className="btn btn-primary">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
