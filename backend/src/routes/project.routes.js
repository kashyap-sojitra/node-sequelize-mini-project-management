const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProjectById, updateProject, deleteProject,
  addMember, removeMember, getMembers, getDashboardStats,
} = require('../controllers/project.controller');
const { createProjectValidation, updateProjectValidation, addMemberValidation } = require('../validations/project.validation');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Project CRUD
router.post('/', createProjectValidation, validate, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProjectValidation, validate, updateProject);
router.delete('/:id', deleteProject);

// Members
router.get('/:id/members', getMembers);
router.post('/:id/members', addMemberValidation, validate, addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
