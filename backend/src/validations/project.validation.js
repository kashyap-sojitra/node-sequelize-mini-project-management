const { body } = require('express-validator');

const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('memberIds')
    .optional()
    .isArray().withMessage('memberIds must be an array'),
  body('memberIds.*')
    .optional()
    .isInt({ min: 1 }).withMessage('Each member ID must be a positive integer'),
];

const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'ARCHIVED', 'COMPLETED']).withMessage('Invalid project status'),
];

const addMemberValidation = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
];

module.exports = { createProjectValidation, updateProjectValidation, addMemberValidation };
