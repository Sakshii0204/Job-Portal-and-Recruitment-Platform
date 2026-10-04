import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCandidateProfile, updateCandidateProfile } from '../services/authService';

const CandidateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    summary: '',
    skills: '',
    education: '',
    experience: '',
    resume_url: '',
    linkedin_url: '',
    github_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getCandidateProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          summary: res.data.summary || '',
          skills: res.data.skills || '',
          education: res.data.education || '',
          experience: res.data.experience || '',
          resume_url: res.data.resume_url || '',
          linkedin_url: res.data.linkedin_url || '',
          github_url: res.data.github_url || ''
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load candidate profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        summary: profile.summary || '',
        skills: profile.skills || '',
        education: profile.education || '',
        experience: profile.experience || '',
        resume_url: profile.resume_url || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || ''
      });
    }
    setIsEditing(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await updateCandidateProfile(formData);
      if (res.success) {
        setProfile(res.data);
        setSuccessMsg('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="profile-header-bar">
        <div>
          <h2>Candidate Profile</h2>
          <p className="text-muted">Manage your personal and professional profile details</p>
        </div>
        <div className="profile-actions-top">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">
              Edit Profile
            </button>
          ) : (
            <button onClick={handleCancel} className="btn btn-outline btn-sm">
              Cancel
            </button>
          )}
          <Link to="/candidate/dashboard" className="btn btn-outline btn-sm">
            Dashboard
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error">
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="card profile-main-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="profile-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address (Account Credential)</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="input-disabled"
                  title="Email cannot be changed"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="form-group">
                <label>Current Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                  placeholder="e.g. Pune, Maharashtra"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Professional Summary */}
          <div className="profile-section">
            <h3 className="section-title">Professional Summary</h3>
            <div className="form-group">
              <label>Bio / Summary</label>
              <textarea
                name="summary"
                rows="4"
                value={formData.summary}
                onChange={handleChange}
                disabled={!isEditing || saving}
                placeholder="Briefly describe your background, career goals, and core strengths..."
              ></textarea>
            </div>
          </div>

          {/* Section 3: Skills & Experience */}
          <div className="profile-section">
            <h3 className="section-title">Skills &amp; Qualifications</h3>
            <div className="form-group">
              <label>Technical Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                disabled={!isEditing || saving}
                placeholder="Comma separated (e.g. React, Node.js, Express, MySQL, Git)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Education</label>
                <textarea
                  name="education"
                  rows="3"
                  value={formData.education}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                  placeholder="Degree, College/University, Graduation Year"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Work Experience</label>
                <textarea
                  name="experience"
                  rows="3"
                  value={formData.experience}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                  placeholder="Previous roles, internships, or key projects"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 4: Links & Portfolio */}
          <div className="profile-section">
            <h3 className="section-title">Online Links &amp; Resume</h3>
            <div className="form-group">
              <label>Resume / CV URL</label>
              <input
                type="url"
                name="resume_url"
                value={formData.resume_url}
                onChange={handleChange}
                disabled={!isEditing || saving}
                placeholder="https://drive.google.com/... or hosted PDF link"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>LinkedIn Profile URL</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="form-group">
                <label>GitHub Profile URL</label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="profile-footer-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-outline" disabled={saving}>
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CandidateProfile;
