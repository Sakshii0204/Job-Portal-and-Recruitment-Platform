import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getJobById,
  checkJobApplicationStatus,
  applyForJob,
  getCandidateProfile
} from '../services/authService';

const JobDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Application modal/form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getJobById(id);
      if (res.success && res.data) {
        setJob(res.data);

        // If candidate, check if already applied and pre-fill resume URL from profile
        if (isAuthenticated && role === 'CANDIDATE') {
          try {
            const statusRes = await checkJobApplicationStatus(id);
            setHasApplied(Boolean(statusRes.hasApplied));

            const profileRes = await getCandidateProfile();
            if (profileRes.success && profileRes.data?.resume_url) {
              setResumeUrl(profileRes.data.resume_url);
            }
          } catch {
            // Non-blocking status check
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Job not found or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setApplyError('');

    try {
      const res = await applyForJob({
        job_id: Number(id),
        cover_letter: coverLetter,
        resume_url: resumeUrl
      });
      if (res.success) {
        setApplySuccess(true);
        setHasApplied(true);
        setShowApplyModal(false);
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary undisclosed';
    const formatLakhs = (val) => {
      const num = Number(val);
      if (num >= 100000) {
        return `₹${(num / 100000).toFixed(1).replace('.0', '')} LPA`;
      }
      return `₹${num.toLocaleString('en-IN')}`;
    };
    if (min && max) return `${formatLakhs(min)} - ${formatLakhs(max)}`;
    if (min) return `From ${formatLakhs(min)}`;
    return `Up to ${formatLakhs(max)}`;
  };

  const isClosed = job && (job.status !== 'ACTIVE' || (job.deadline && new Date(job.deadline) < new Date()));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (errorMsg || !job) {
    return (
      <div className="page-container">
        <div className="card empty-state-card">
          <h2>Job Not Found</h2>
          <p className="text-muted">{errorMsg || 'The requested job posting does not exist.'}</p>
          <Link to="/jobs" className="btn btn-primary mt-sm">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container job-details-page">
      <div className="job-details-breadcrumb">
        <Link to="/jobs">← Back to All Jobs</Link>
      </div>

      {applySuccess && (
        <div className="alert alert-success mt-sm">
          <span>🎉 Application submitted successfully! You can track its status in My Applications.</span>
          <Link to="/candidate/applications" className="alert-link-btn">
            View Applications →
          </Link>
        </div>
      )}

      <div className="job-details-layout">
        {/* Main Job Information */}
        <div className="job-details-main">
          <div className="card job-header-card">
            <div className="job-title-header">
              <div>
                <span className="job-company-badge">{job.company_name}</span>
                <h1 className="job-main-title">{job.title}</h1>
              </div>
              <span className={`pill-badge badge-${job.work_mode.toLowerCase()}`}>
                {job.work_mode}
              </span>
            </div>

            <div className="job-key-facts-grid">
              <div className="fact-box">
                <span className="fact-label">Location</span>
                <span className="fact-value">📍 {job.location}</span>
              </div>
              <div className="fact-box">
                <span className="fact-label">Job Type</span>
                <span className="fact-value">💼 {job.job_type.replace('_', ' ')}</span>
              </div>
              <div className="fact-box">
                <span className="fact-label">Compensation</span>
                <span className="fact-value">💰 {formatSalary(job.min_salary, job.max_salary)}</span>
              </div>
              <div className="fact-box">
                <span className="fact-label">Experience</span>
                <span className="fact-value">⏳ {job.experience_required || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="card job-content-card">
            <h2 className="section-heading">Job Description</h2>
            <p className="job-full-description">{job.description}</p>

            {job.required_skills && (
              <>
                <h2 className="section-heading mt-md">Required Skills &amp; Technologies</h2>
                <div className="skills-tags-list full-skills-list">
                  {job.required_skills.split(',').map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="job-additional-info-row mt-md">
              {job.deadline && (
                <div className="info-badge">
                  📅 <strong>Application Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
                </div>
              )}
              <div className="info-badge">
                🕒 <strong>Posted Date:</strong> {new Date(job.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Action Card */}
        <div className="job-details-sidebar">
          <div className="card apply-action-card">
            <h3>Ready to Apply?</h3>
            <p className="text-muted">
              Submit your profile and resume to be considered for this position at {job.company_name}.
            </p>

            <div className="action-buttons-group">
              {isClosed ? (
                <div className="badge-closed-notice">
                  ⚠️ Applications Closed for this position
                </div>
              ) : hasApplied ? (
                <div className="already-applied-box">
                  <div className="check-icon">✓</div>
                  <strong>Already Applied</strong>
                  <p>You have submitted an application for this role.</p>
                  <Link to="/candidate/applications" className="btn btn-outline btn-block btn-sm">
                    View in My Applications
                  </Link>
                </div>
              ) : !isAuthenticated ? (
                <div className="guest-apply-box">
                  <p className="text-muted">Sign in with a Candidate account to submit an application.</p>
                  <Link to="/login" className="btn btn-primary btn-block">
                    Sign In to Apply
                  </Link>
                  <Link to="/register" className="btn btn-outline btn-block btn-sm">
                    Create Candidate Account
                  </Link>
                </div>
              ) : role !== 'CANDIDATE' ? (
                <div className="recruiter-notice-box">
                  <span>Only candidate accounts can apply for jobs.</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="btn btn-primary btn-lg btn-block"
                >
                  Apply Now →
                </button>
              )}
            </div>

            <div className="sidebar-company-summary">
              <h4>About the Hiring Company</h4>
              <p><strong>{job.company_name}</strong> is currently expanding its engineering and technology division.</p>
              <div className="company-meta-item">
                <span>Location:</span> <strong>{job.location}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div>
                <h3>Apply for {job.title}</h3>
                <span className="text-muted">{job.company_name}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="modal-close-btn"
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            {applyError && (
              <div className="alert alert-error">
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter / Note to Recruiter</label>
                <textarea
                  id="coverLetter"
                  rows="5"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit for this role..."
                  disabled={submitting}
                ></textarea>
                <span className="field-hint">Highlight key achievements, passion, and relevant experience.</span>
              </div>

              <div className="form-group">
                <label htmlFor="resumeUrl">Resume / Portfolio URL</label>
                <input
                  id="resumeUrl"
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or hosted PDF link"
                  disabled={submitting}
                />
                <span className="field-hint">Pre-filled from your profile if available.</span>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting Application...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
