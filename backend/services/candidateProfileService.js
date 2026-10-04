const CandidateProfileModel = require('../models/candidateProfileModel');

const isValidUrl = (string) => {
  if (!string || typeof string !== 'string') return true;
  const trimmed = string.trim();
  if (trimmed === '') return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

class CandidateProfileService {
  /**
   * Get candidate profile
   */
  static async getProfile(userId) {
    const profile = await CandidateProfileModel.findByUserId(userId);
    if (!profile) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      throw error;
    }
    return profile;
  }

  /**
   * Update candidate profile with validation
   */
  static async updateProfile(userId, data) {
    const {
      name,
      phone,
      location,
      summary,
      skills,
      education,
      experience,
      resume_url,
      linkedin_url,
      github_url
    } = data;

    const errors = [];

    // Length checks
    if (summary && summary.length > 2000) {
      errors.push('Professional summary must not exceed 2000 characters');
    }
    if (location && location.length > 255) {
      errors.push('Location must not exceed 255 characters');
    }
    if (skills && skills.length > 1000) {
      errors.push('Skills must not exceed 1000 characters');
    }
    if (education && education.length > 1000) {
      errors.push('Education must not exceed 1000 characters');
    }
    if (experience && experience.length > 1000) {
      errors.push('Experience must not exceed 1000 characters');
    }

    // URL validations
    if (resume_url && !isValidUrl(resume_url)) {
      errors.push('Resume URL must be a valid HTTP or HTTPS link');
    }
    if (linkedin_url && !isValidUrl(linkedin_url)) {
      errors.push('LinkedIn URL must be a valid HTTP or HTTPS link');
    }
    if (github_url && !isValidUrl(github_url)) {
      errors.push('GitHub URL must be a valid HTTP or HTTPS link');
    }

    if (errors.length > 0) {
      const err = new Error(errors[0]);
      err.statusCode = 400;
      err.errors = errors;
      throw err;
    }

    // Update user base info if supplied
    if (name || phone !== undefined) {
      await CandidateProfileModel.updateUserBaseInfo(userId, { name, phone });
    }

    // Upsert candidate profile
    const updated = await CandidateProfileModel.upsertProfile(userId, {
      location: location ? location.trim() : null,
      summary: summary ? summary.trim() : null,
      skills: skills ? skills.trim() : null,
      education: education ? education.trim() : null,
      experience: experience ? experience.trim() : null,
      resume_url: resume_url ? resume_url.trim() : null,
      linkedin_url: linkedin_url ? linkedin_url.trim() : null,
      github_url: github_url ? github_url.trim() : null
    });

    return updated;
  }
}

module.exports = CandidateProfileService;
