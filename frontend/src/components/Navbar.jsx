import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = role === 'RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <span className="brand-text">Career<span>Hub</span></span>
        </Link>

        <nav className="navbar-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/jobs" className="nav-link">Find Jobs</Link>

          {isAuthenticated ? (
            <div className="nav-auth-group">
              <Link to={dashboardPath} className="nav-link dashboard-link">
                Dashboard
              </Link>
              {role === 'CANDIDATE' && (
                <>
                  <Link to="/candidate/profile" className="nav-link">
                    My Profile
                  </Link>
                  <Link to="/candidate/applications" className="nav-link">
                    Applications
                  </Link>
                </>
              )}
              {role === 'RECRUITER' && (
                <>
                  <Link to="/recruiter/jobs" className="nav-link">
                    My Jobs
                  </Link>
                  <Link to="/recruiter/jobs/create" className="nav-link">
                    Post Job
                  </Link>
                </>
              )}
              <div className="user-profile-badge">
                <span className={`role-pill role-${role ? role.toLowerCase() : 'user'}`}>
                  {role}
                </span>
                <span className="user-name">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-guest-group">
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
};

export default Navbar;
