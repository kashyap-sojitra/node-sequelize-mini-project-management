const { body } = require('express-validator');

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Priority must be LOW, MEDIUM, HIGH, or URGENT'),
  body('due_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date'),
  body('project_id')
    .notEmpty().withMessage('Project ID is required')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  body('assigned_to')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Assigned user ID must be a positive integer'),
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Priority must be LOW, MEDIUM, HIGH, or URGENT'),
  body('due_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date'),
  body('assigned_to')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Assigned user ID must be a positive integer'),
];

module.exports = { createTaskValidation, updateTaskValidation };
