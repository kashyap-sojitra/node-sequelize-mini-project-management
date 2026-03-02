const { sequelize } = require('../models');
const projectRepository = require('../repositories/project.repository');
const taskRepository = require('../repositories/task.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

class ProjectService {
  async createProject({ name, description, memberIds = [] }, userId) {
    const transaction = await sequelize.transaction();

    try {
      // Create project
      const project = await projectRepository.create(
        { name, description, owner_id: userId },
        transaction
      );

      // Add owner as an OWNER member
      await projectRepository.addMember(project.id, userId, 'OWNER', transaction);

      // Add additional members
      if (memberIds.length > 0) {
        const validUsers = await userRepository.findByIds(memberIds);
        const validIds = validUsers.map((u) => u.id);

        for (const memberId of validIds) {
          if (memberId !== userId) {
            await projectRepository.addMember(project.id, memberId, 'MEMBER', transaction);
          }
        }
      }

      await transaction.commit();

      return projectRepository.findById(project.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getProjects(userId, paginationOptions) {
    return projectRepository.findByUser(userId, paginationOptions);
  }

  async getProjectById(id, userId) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  }

  async updateProject(id, data, userId) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (project.owner_id !== userId) {
      throw new AppError('Only the project owner can update this project', 403);
    }

    return projectRepository.update(id, data);
  }

  async deleteProject(id, userId) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (project.owner_id !== userId) {
      throw new AppError('Only the project owner can delete this project', 403);
    }

    return projectRepository.delete(id);
  }

  async addMember(projectId, userId, role, currentUserId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (project.owner_id !== currentUserId) {
      throw new AppError('Only the project owner can add members', 403);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const [member, created] = await projectRepository.addMember(projectId, userId, role);
    if (!created) {
      throw new AppError('User is already a member of this project', 409);
    }

    return member;
  }

  async removeMember(projectId, userId, currentUserId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (project.owner_id !== currentUserId) {
      throw new AppError('Only the project owner can remove members', 403);
    }
    if (parseInt(userId) === project.owner_id) {
      throw new AppError('Cannot remove the project owner', 400);
    }

    const deleted = await projectRepository.removeMember(projectId, userId);
    if (!deleted) {
      throw new AppError('Member not found in this project', 404);
    }
    return true;
  }

  async getMembers(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return projectRepository.getMembers(projectId);
  }

  async getDashboardStats(userId) {
    const projectCount = await projectRepository.countByUser(userId);
    const taskStats = await taskRepository.getStats(userId);

    return {
      projectCount,
      ...taskStats,
    };
  }
}

module.exports = new ProjectService();
