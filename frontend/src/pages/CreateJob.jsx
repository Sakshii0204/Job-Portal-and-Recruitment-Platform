import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecruiterJob } from '../services/authService';

export default function CreateJob() {
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic frontend checks
    if (!formData.title.trim() || !formData.company_name.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields (Title, Company, Description, Location).');
      return;
    }

    if (formData.min_salary && formData.max_salary) {
      if (Number(formData.min_salary) > Number(formData.max_salary)) {
        setError('Minimum salary cannot exceed maximum salary.');
        return;
      }
    }

    if (formData.deadline) {
      const selected = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        setError('Deadline cannot be in the past.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        min_salary: formData.min_salary ? Number(formData.min_salary) : null,
        max_salary: formData.max_salary ? Number(formData.max_salary) : null,
        deadline: formData.deadline || null
      };

      const res = await createRecruiterJob(payload);
      if (res.data?.success) {
        navigate('/recruiter/jobs');
      } else {
        setError(res.data?.message || 'Failed to post job');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error while creating job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div className="card">
        <h2>Post New Job</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Create a targeted job posting for candidates on the platform.
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
              placeholder="e.g. Senior Frontend Engineer"
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
                placeholder="e.g. Acme Corp"
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
                placeholder="e.g. Bangalore, India"
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
                placeholder="e.g. 3+ years"
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Min Salary ($ or ₹ / yr)</label>
              <input
                type="number"
                name="min_salary"
                value={formData.min_salary}
                onChange={handleChange}
                placeholder="e.g. 60000"
              />
            </div>

            <div className="form-group">
              <label>Max Salary ($ or ₹ / yr)</label>
              <input
                type="number"
                name="max_salary"
                value={formData.max_salary}
                onChange={handleChange}
                placeholder="e.g. 90000"
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
              placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
            />
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a comprehensive job description, responsibilities, and qualifications..."
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/recruiter/jobs')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Job Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
