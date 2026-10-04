const CandidateProfileService = require('../services/candidateProfileService');

/**
 * Get current candidate's profile
 * GET /api/candidate/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await CandidateProfileService.getProfile(userId);
    res.status(200).json({
      success: true,
      message: 'Candidate profile fetched successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current candidate's profile
 * PUT /api/candidate/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await CandidateProfileService.updateProfile(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Candidate profile updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
