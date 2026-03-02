const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

class AuthService {
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const user = await userRepository.create({ name, email, password });
    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

module.exports = new AuthService();
