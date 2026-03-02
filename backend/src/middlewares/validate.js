const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new AppError('Validation failed', 400, formattedErrors));
  }
  next();
};

module.exports = validate;
