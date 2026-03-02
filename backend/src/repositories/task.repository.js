const { Op } = require('sequelize');
const { Task, User, Project } = require('../models');

class TaskRepository {
  async create(data) {
    return Task.create(data);
  }

  async findById(id) {
    return Task.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
    });
  }

  async findAllPaginated({ limit, offset, order, where = {} }) {
    return Task.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
      distinct: true,
    });
  }

  async findByProject(projectId, { limit, offset, order, where = {} }) {
    const finalWhere = { ...where, project_id: projectId };
    return this.findAllPaginated({ limit, offset, order, where: finalWhere });
  }

  async update(id, data) {
    const task = await Task.findByPk(id);
    if (!task) return null;
    return task.update(data);
  }

  async delete(id) {
    const task = await Task.findByPk(id);
    if (!task) return null;
    await task.destroy();
    return task;
  }

  async countByProject(projectId) {
    return Task.count({ where: { project_id: projectId } });
  }

  async countByStatus(projectId) {
    return Task.findAll({
      where: { project_id: projectId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });
  }

  async countByUser(userId) {
    return Task.count({ where: { assigned_to: userId } });
  }

  async countAll() {
    return Task.count();
  }

  async getStats(userId) {
    const totalTasks = await Task.count({ where: { assigned_to: userId } });
    const todoTasks = await Task.count({ where: { assigned_to: userId, status: 'TODO' } });
    const inProgressTasks = await Task.count({ where: { assigned_to: userId, status: 'IN_PROGRESS' } });
    const doneTasks = await Task.count({ where: { assigned_to: userId, status: 'DONE' } });
    const overdueTasks = await Task.count({
      where: {
        assigned_to: userId,
        status: { [Op.ne]: 'DONE' },
        due_date: { [Op.lt]: new Date() },
      },
    });

    return { totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks };
  }
}

module.exports = new TaskRepository();
