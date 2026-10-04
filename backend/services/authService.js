const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/generateToken');

class AuthService {
  /**
   * Register a new user
   */
  static async register({ name, email, password, role, phone }) {
    // 1. Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      const error = new Error('User already exists with this email address');
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Save user to database
    const newUser = await UserModel.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    // 4. Generate JWT
    const token = generateToken({
      id: newUser.id,
      role: newUser.role,
      email: newUser.email
    });

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    };
  }

  /**
   * Authenticate user with email and password
   */
  static async login({ email, password }) {
    // 1. Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 2. Compare password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 3. Generate JWT
    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    };
  }

  /**
   * Get user profile by ID
   */
  static async getCurrentUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = AuthService;
