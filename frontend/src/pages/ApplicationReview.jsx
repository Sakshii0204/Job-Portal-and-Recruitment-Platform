import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getApplicationDetails, updateApplicationStatus } from '../services/authService';

export default function ApplicationReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getApplicationDetails(id);
      if (res.data?.success) {
        setApplication(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load application');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error loading application');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    let confirmPrompt = `Change status to ${newStatus}?`;
    if (newStatus === 'REJECTED') {
      confirmPrompt = `Are you sure you want to reject ${application?.candidate_name}?`;
    } else if (newStatus === 'ACCEPTED') {
      confirmPrompt = `Confirm accepting ${application?.candidate_name} for this position?`;
    }

    if (!window.confirm(confirmPrompt)) {
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccessMsg('');
      const res = await updateApplicationStatus(id, newStatus);
      if (res.data?.success) {
        setSuccessMsg(`Status successfully updated to ${newStatus}`);
        setApplication((prev) => ({ ...prev, status: newStatus }));
      } else {
        setError(res.data?.message || 'Status update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error updating status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}>
        <p>Loading candidate application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container" style={{ margin: '40px auto' }}>
        <div className="alert alert-error">{error || 'Application not found'}</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '40px auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/recruiter/jobs/${application.job_id}/applications`} style={{ textDecoration: 'none', color: '#64748b' }}>
          &larr; Back to Job Applicants
        </Link>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Main Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ marginBottom: '4px' }}>{application.candidate_name}</h2>
            <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '0.9rem', flexWrap: 'wrap' }}>
              <span>✉ {application.candidate_email}</span>
              {application.candidate_phone && <span>📞 {application.candidate_phone}</span>}
              {application.candidate_location && <span>📍 {application.candidate_location}</span>}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge badge-${application.status.toLowerCase()}`} style={{ fontSize: '1rem', padding: '6px 14px' }}>
              {application.status}
            </span>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
              Applied: {new Date(application.applied_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.9rem', color: '#475569' }}>
            Position: <strong>{application.job_title}</strong> at {application.company_name}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {application.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStatusUpdate('SHORTLISTED')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Shortlist Candidate'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Reject Application'}
                </button>
              </>
            )}

            {application.status === 'SHORTLISTED' && (
              <>
                <button
                  type="button"
                  className="btn"
                  style={{ background: '#16a34a', color: '#fff' }}
                  onClick={() => handleStatusUpdate('ACCEPTED')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Accept Candidate'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Reject Application'}
                </button>
              </>
            )}

            {application.status === 'ACCEPTED' && (
              <span className="badge" style={{ background: '#dcfce7', color: '#15803d', padding: '8px 16px', fontSize: '0.9rem' }}>
                Application Accepted
              </span>
            )}

            {application.status === 'REJECTED' && (
              <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 16px', fontSize: '0.9rem' }}>
                Application Rejected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          {/* Cover Letter */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Cover Letter / Note</h3>
            <div style={{ marginTop: '12px', whiteSpace: 'pre-line', color: '#334155', lineHeight: '1.6' }}>
              {application.cover_letter || 'No cover letter provided.'}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Professional Summary</h3>
            <div style={{ marginTop: '12px', color: '#334155', lineHeight: '1.6' }}>
              {application.candidate_summary || 'No summary provided in profile.'}
            </div>
          </div>

          {/* Experience */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Work Experience</h3>
            <div style={{ marginTop: '12px', whiteSpace: 'pre-line', color: '#334155', lineHeight: '1.6' }}>
              {application.candidate_experience || 'No experience details specified.'}
            </div>
          </div>

          {/* Education */}
          <div className="card">
            <h3>Education</h3>
            <div style={{ marginTop: '12px', whiteSpace: 'pre-line', color: '#334155', lineHeight: '1.6' }}>
              {application.candidate_education || 'No education details specified.'}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h4>Candidate Skills</h4>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {application.candidate_skills ? (
                application.candidate_skills.split(',').map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#475569'
                    }}
                  >
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>No skills listed</span>
              )}
            </div>
          </div>

          <div className="card">
            <h4>Documents & Links</h4>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {application.resume_url ? (
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ textAlign: 'center' }}
                >
                  📄 View Resume
                </a>
              ) : (
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>No resume submitted</span>
              )}

              {application.candidate_linkedin && (
                <a
                  href={application.candidate_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ textAlign: 'center' }}
                >
                  LinkedIn Profile
                </a>
              )}

              {application.candidate_github && (
                <a
                  href={application.candidate_github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ textAlign: 'center' }}
                >
                  GitHub Profile
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
