const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

class UserService {
  async getAllUsers() {
    return userRepository.findAll();
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

module.exports = new UserService();
