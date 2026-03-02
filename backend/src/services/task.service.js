const { Op } = require('sequelize');
const taskRepository = require('../repositories/task.repository');
const projectRepository = require('../repositories/project.repository');
const AppError = require('../utils/AppError');

class TaskService {
  async createTask(data, userId) {
    // Verify project exists
    const project = await projectRepository.findById(data.project_id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return taskRepository.create({ ...data, created_by: userId });
  }

  async getTasks(query, paginationOptions) {
    const where = {};

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Filter by priority
    if (query.priority) {
      where.priority = query.priority;
    }

    // Filter by project
    if (query.project_id) {
      where.project_id = parseInt(query.project_id);
    }

    // Filter by assigned user
    if (query.assigned_to) {
      where.assigned_to = parseInt(query.assigned_to);
    }

    // Filter by due date
    if (query.due_before) {
      where.due_date = { ...(where.due_date || {}), [Op.lte]: query.due_before };
    }
    if (query.due_after) {
      where.due_date = { ...(where.due_date || {}), [Op.gte]: query.due_after };
    }

    // Search by title
    if (query.search) {
      where.title = { [Op.like]: `%${query.search}%` };
    }

    return taskRepository.findAllPaginated({ ...paginationOptions, where });
  }

  async getTaskById(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  async getTasksByProject(projectId, query, paginationOptions) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const where = {};

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assigned_to) where.assigned_to = parseInt(query.assigned_to);
    if (query.search) where.title = { [Op.like]: `%${query.search}%` };

    return taskRepository.findByProject(projectId, { ...paginationOptions, where });
  }

  async updateTask(id, data, userId) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const updated = await taskRepository.update(id, data);
    return taskRepository.findById(id);
  }

  async deleteTask(id, userId) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return taskRepository.delete(id);
  }

  async getTaskStats(projectId) {
    return taskRepository.countByStatus(projectId);
  }
}

module.exports = new TaskService();
