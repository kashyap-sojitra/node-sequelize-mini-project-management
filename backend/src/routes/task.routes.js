const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, getTasksByProject, updateTask, deleteTask } = require('../controllers/task.controller');
const { createTaskValidation, updateTaskValidation } = require('../validations/task.validation');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.post('/', createTaskValidation, validate, createTask);
router.get('/', getTasks);
router.get('/project/:projectId', getTasksByProject);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskValidation, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
