import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecruiterJobs, closeRecruiterJob } from '../services/authService';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [closingId, setClosingId] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getRecruiterJobs();
      if (res.data?.success) {
        setJobs(res.data.data || []);
      } else {
        setError(res.data?.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error loading jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to close "${jobTitle}"? Closed jobs stop receiving new applications.`)) {
      return;
    }

    try {
      setClosingId(jobId);
      setActionMsg('');
      const res = await closeRecruiterJob(jobId);
      if (res.data?.success) {
        setActionMsg(`Job "${jobTitle}" was closed successfully.`);
        // Update local state
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'CLOSED' } : j))
        );
      } else {
        setError(res.data?.message || 'Failed to close job');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error closing job');
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Manage My Jobs</h2>
          <p className="text-muted">Oversee active and closed postings, view applicant counts, and edit details.</p>
        </div>
        <Link to="/recruiter/jobs/create" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      {actionMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{actionMsg}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>Loading your jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>No jobs posted yet</h3>
          <p className="text-muted" style={{ margin: '12px 0 24px' }}>
            Get started by creating your first job listing to receive applications.
          </p>
          <Link to="/recruiter/jobs/create" className="btn btn-primary">
            Post a Job Now
          </Link>
        </div>
      ) : (
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color, #e2e8f0)' }}>
                <th style={{ padding: '12px 8px' }}>Job Title</th>
                <th style={{ padding: '12px 8px' }}>Location / Mode</th>
                <th style={{ padding: '12px 8px' }}>Type</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px' }}>Applicants</th>
                <th style={{ padding: '12px 8px' }}>Posted On</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                  <td style={{ padding: '14px 8px', fontWeight: '500' }}>
                    <Link to={`/recruiter/jobs/${job.id}/applications`} style={{ color: 'var(--primary-color, #2563eb)', textDecoration: 'none' }}>
                      {job.title}
                    </Link>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{job.company_name}</div>
                  </td>
                  <td style={{ padding: '14px 8px', fontSize: '0.9rem' }}>
                    {job.location} <span style={{ color: '#94a3b8' }}>•</span> {job.work_mode}
                  </td>
                  <td style={{ padding: '14px 8px', fontSize: '0.9rem' }}>
                    {job.job_type.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <span className={`badge badge-${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <Link
                      to={`/recruiter/jobs/${job.id}/applications`}
                      className="badge"
                      style={{ background: '#e0f2fe', color: '#0369a1', textDecoration: 'none', fontWeight: '600' }}
                    >
                      {job.application_count || 0} Applicants
                    </Link>
                  </td>
                  <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link
                        to={`/recruiter/jobs/${job.id}/applications`}
                        className="btn btn-sm btn-outline"
                        style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                      >
                        Applicants
                      </Link>
                      <Link
                        to={`/recruiter/jobs/${job.id}/edit`}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                      >
                        Edit
                      </Link>
                      {job.status === 'ACTIVE' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          onClick={() => handleCloseJob(job.id, job.title)}
                          disabled={closingId === job.id}
                        >
                          {closingId === job.id ? 'Closing...' : 'Close'}
                        </button>
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
