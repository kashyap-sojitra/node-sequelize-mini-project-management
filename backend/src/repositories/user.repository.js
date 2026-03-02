const { User } = require('../models');

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findById(id) {
    return User.findByPk(id);
  }

  async findAll() {
    return User.findAll({
      attributes: ['id', 'name', 'email', 'avatar', 'created_at'],
      order: [['name', 'ASC']],
    });
  }

  async findByIds(ids) {
    const { Op } = require('sequelize');
    return User.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'name', 'email'],
    });
  }
}

module.exports = new UserRepository();
