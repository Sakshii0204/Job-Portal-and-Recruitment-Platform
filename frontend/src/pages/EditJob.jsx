import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecruiterJobById, updateRecruiterJob } from '../services/authService';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    description: '',
    required_skills: '',
    location: '',
    job_type: 'FULL_TIME',
    work_mode: 'ONSITE',
    experience_required: '',
    min_salary: '',
    max_salary: '',
    deadline: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await getRecruiterJobById(id);
      if (res.data?.success && res.data?.data) {
        const j = res.data.data;
        let formattedDeadline = '';
        if (j.deadline) {
          formattedDeadline = new Date(j.deadline).toISOString().split('T')[0];
        }

        setFormData({
          title: j.title || '',
          company_name: j.company_name || '',
          description: j.description || '',
          required_skills: j.required_skills || '',
          location: j.location || '',
          job_type: j.job_type || 'FULL_TIME',
          work_mode: j.work_mode || 'ONSITE',
          experience_required: j.experience_required || '',
          min_salary: j.min_salary != null ? j.min_salary : '',
          max_salary: j.max_salary != null ? j.max_salary : '',
          deadline: formattedDeadline
        });
      } else {
        setError(res.data?.message || 'Failed to load job');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading job details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.company_name.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.min_salary && formData.max_salary) {
      if (Number(formData.min_salary) > Number(formData.max_salary)) {
        setError('Minimum salary cannot exceed maximum salary.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        min_salary: formData.min_salary ? Number(formData.min_salary) : null,
        max_salary: formData.max_salary ? Number(formData.max_salary) : null,
        deadline: formData.deadline || null
      };

      const res = await updateRecruiterJob(id, payload);
      if (res.data?.success) {
        navigate('/recruiter/jobs');
      } else {
        setError(res.data?.message || 'Failed to update job');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error while updating job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center' }}>
        <p>Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div className="card">
        <h2>Edit Job Posting</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Update role specifications, requirements, and salary range.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Job Type *</label>
              <select name="job_type" value={formData.job_type} onChange={handleChange}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div className="form-group">
              <label>Work Mode *</label>
              <select name="work_mode" value={formData.work_mode} onChange={handleChange}>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience</label>
              <input
                type="text"
                name="experience_required"
                value={formData.experience_required}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Min Salary</label>
              <input
                type="number"
                name="min_salary"
                value={formData.min_salary}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Max Salary</label>
              <input
                type="number"
                name="max_salary"
                value={formData.max_salary}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Required Skills (comma-separated)</label>
            <input
              type="text"
              name="required_skills"
              value={formData.required_skills}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/recruiter/jobs')}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
