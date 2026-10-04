import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkHealth } from '../services/authService';

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkHealth()
      .then((res) => {
        if (res.success) setApiStatus('online');
        else setApiStatus('offline');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  const dashboardPath = role === 'RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard';

  return (
    <div className="page-container home-page">
      <div className="hero-section">
        <div className="hero-badge">
          <span className={`status-dot ${apiStatus}`}></span>
          <span>Backend API: {apiStatus === 'online' ? 'Online (Port 5000)' : apiStatus === 'checking' ? 'Checking...' : 'Offline'}</span>
        </div>

        <h1 className="hero-title">
          Job Portal &amp; Recruitment <span>Platform</span>
        </h1>
        <p className="hero-subtitle">
          Phase 1 Foundation: Secure authentication, bcrypt password hashing, JWT authorization, and role-based access for Candidates &amp; Recruiters.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to={dashboardPath} className="btn btn-primary btn-lg">
              Go to Your {role === 'RECRUITER' ? 'Recruiter' : 'Candidate'} Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon candidate-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3>Candidate Portal</h3>
          <p>
            Dedicated candidate registration, session management, and dashboard workspace ready for Phase 2 job searching and applications.
          </p>
          <span className="badge-phase">Phase 1 Active</span>
        </div>

        <div className="feature-card">
          <div className="feature-icon recruiter-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h3>Recruiter Workspace</h3>
          <p>
            Role-gated recruiter access enforced on both backend and frontend routes, structured for Phase 3 job postings and candidate tracking.
          </p>
          <span className="badge-phase">Phase 1 Active</span>
        </div>

        <div className="feature-card">
          <div className="feature-icon security-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3>Security &amp; JWT</h3>
          <p>
            Bcrypt password hashing (10 salt rounds), secure token verification middleware, and strict parameterized MySQL queries.
          </p>
          <span className="badge-phase">Zero Plain-text</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
