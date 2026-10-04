const AuthService = require('../services/authService');
const { validateRegistration, validateLogin } = require('../utils/validation');

/**
 * Controller for User Registration
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate inputs
    const { isValid, errors } = validateRegistration({ name, email, password, role, phone });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors
      });
    }

    const result = await AuthService.register({
      name,
      email,
      password,
      role,
      phone
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for User Login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    const { isValid, errors } = validateLogin({ email, password });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors
      });
    }

    const result = await AuthService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for Current Authenticated User Profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
