const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Project name is required' },
      len: { args: [2, 200], msg: 'Project name must be between 2 and 200 characters' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'ARCHIVED', 'COMPLETED'),
    defaultValue: 'ACTIVE',
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'projects',
});

module.exports = Project;
