/**
 * Candidate test endpoint controller
 * GET /api/candidate/test
 */
const candidateTest = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Candidate access granted. You have access to candidate resources.',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
};

/**
 * Recruiter test endpoint controller
 * GET /api/recruiter/test
 */
const recruiterTest = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Recruiter access granted. You have access to recruiter resources.',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
};

module.exports = {
  candidateTest,
  recruiterTest
};
