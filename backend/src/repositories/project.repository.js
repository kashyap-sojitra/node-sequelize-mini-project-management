const { Op } = require('sequelize');
const { Project, User, ProjectMember, Task, sequelize } = require('../models');

class ProjectRepository {
  async create(data, transaction = null) {
    return Project.create(data, { transaction });
  }

  async findById(id) {
    return Project.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } },
      ],
    });
  }

  async findAllPaginated({ limit, offset, order, where = {} }) {
    return Project.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
      distinct: true,
    });
  }

  async findByUser(userId, { limit, offset, order }) {
    return Project.findAndCountAll({
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        {
          model: User,
          as: 'members',
          attributes: [],
          through: { attributes: [] },
          where: { id: userId },
        },
      ],
      limit,
      offset,
      order,
      distinct: true,
    });
  }

  async update(id, data) {
    const project = await Project.findByPk(id);
    if (!project) return null;
    return project.update(data);
  }

  async delete(id) {
    const project = await Project.findByPk(id);
    if (!project) return null;
    await project.destroy();
    return project;
  }

  async addMember(projectId, userId, role = 'MEMBER', transaction = null) {
    return ProjectMember.findOrCreate({
      where: { project_id: projectId, user_id: userId },
      defaults: { project_id: projectId, user_id: userId, role },
      transaction,
    });
  }

  async removeMember(projectId, userId) {
    return ProjectMember.destroy({
      where: { project_id: projectId, user_id: userId },
    });
  }

  async getMembers(projectId) {
    return ProjectMember.findAll({
      where: { project_id: projectId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
    });
  }

  async countByUser(userId) {
    return ProjectMember.count({ where: { user_id: userId } });
  }
}

module.exports = new ProjectRepository();
