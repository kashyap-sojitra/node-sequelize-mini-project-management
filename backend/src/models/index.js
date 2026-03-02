const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const ProjectMember = require('./ProjectMember');

// ─── User <-> Project (Owner) ───
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// ─── User <-> Project (Many-to-Many through ProjectMember) ───
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'user_id',
  otherKey: 'project_id',
  as: 'projects',
});
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'project_id',
  otherKey: 'user_id',
  as: 'members',
});

// ─── Project <-> Task ───
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// ─── User <-> Task (assignedTo) ───
User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// ─── User <-> Task (createdBy) ───
User.hasMany(Task, { foreignKey: 'created_by', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// ─── ProjectMember direct associations ───
ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  ProjectMember,
};
