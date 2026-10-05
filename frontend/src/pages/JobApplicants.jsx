import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobApplicants, updateApplicationStatus } from '../services/authService';

export default function JobApplicants() {
  const { jobId } = useParams();
  const [data, setData] = useState({ job: null, applications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadApplicants();
  }, [jobId]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getJobApplicants(jobId);
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load applicants');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error loading applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus, candidateName) => {
    let confirmMsg = `Update application status to ${newStatus}?`;
    if (newStatus === 'REJECTED') {
      confirmMsg = `Are you sure you want to reject ${candidateName || 'this candidate'}?`;
    } else if (newStatus === 'ACCEPTED') {
      confirmMsg = `Are you sure you want to ACCEPT ${candidateName || 'this candidate'}?`;
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setUpdatingId(appId);
      setSuccessMsg('');
      setError('');
      const res = await updateApplicationStatus(appId, newStatus);
      if (res.data?.success) {
        setSuccessMsg(`Application status updated to ${newStatus}`);
        setData((prev) => ({
          ...prev,
          applications: prev.applications.map((app) =>
            app.id === appId ? { ...app, status: newStatus } : app
          )
        }));
      } else {
        setError(res.data?.message || 'Status update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}>
        <p>Loading applicants...</p>
      </div>
    );
  }

  const job = data.job;
  const applications = data.applications || [];

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/recruiter/jobs" style={{ textDecoration: 'none', color: '#64748b', fontSize: '0.9rem' }}>
          &larr; Back to My Jobs
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '12px' }}>
          <div>
            <h2>Applicants for: {job ? job.title : `Job #${jobId}`}</h2>
            <p className="text-muted">
              {job?.company_name} • {job?.location} • {job?.job_type?.replace('_', ' ')} • Status: <strong>{job?.status}</strong>
            </p>
          </div>
          <span className="badge" style={{ fontSize: '1rem', padding: '6px 14px', background: '#e0f2fe', color: '#0369a1' }}>
            {applications.length} Total Applicants
          </span>
        </div>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{successMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>No applications received yet</h3>
          <p className="text-muted" style={{ marginTop: '8px' }}>
            Candidates applying to this job will appear here for review, shortlisting, and hiring decisions.
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color, #e2e8f0)' }}>
                <th style={{ padding: '12px 8px' }}>Candidate</th>
                <th style={{ padding: '12px 8px' }}>Skills & Profile</th>
                <th style={{ padding: '12px 8px' }}>Applied Date</th>
                <th style={{ padding: '12px 8px' }}>Resume</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{app.candidate_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.candidate_email}</div>
                    {app.candidate_phone && (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{app.candidate_phone}</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 8px', maxWidth: '280px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.candidate_skills || 'No skills listed'}
                    </div>
                    {app.candidate_location && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        📍 {app.candidate_location}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    {app.resume_url ? (
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        📄 Resume
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <span className={`badge badge-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      <Link
                        to={`/recruiter/applications/${app.id}`}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      >
                        Details
                      </Link>

                      {/* Status Action Buttons */}
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleStatusChange(app.id, 'SHORTLISTED', app.candidate_name)}
                            disabled={updatingId === app.id}
                          >
                            Shortlist
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleStatusChange(app.id, 'REJECTED', app.candidate_name)}
                            disabled={updatingId === app.id}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {app.status === 'SHORTLISTED' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#16a34a', color: '#fff' }}
                            onClick={() => handleStatusChange(app.id, 'ACCEPTED', app.candidate_name)}
                            disabled={updatingId === app.id}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleStatusChange(app.id, 'REJECTED', app.candidate_name)}
                            disabled={updatingId === app.id}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {app.status === 'ACCEPTED' && (
                        <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '600' }}>✓ Accepted</span>
                      )}

                      {app.status === 'REJECTED' && (
                        <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '600' }}>✕ Rejected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
