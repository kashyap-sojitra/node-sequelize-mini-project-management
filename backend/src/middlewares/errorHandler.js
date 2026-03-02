const AppError = require('../utils/AppError');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    err = new AppError('Validation failed', 400, errors);
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    err = new AppError('Duplicate field value', 409, errors);
  }

  // Sequelize foreign key constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    err = new AppError('Referenced resource does not exist', 400);
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors || null,
      stack: err.stack,
    });
  }

  // Production: only send operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Programming or unknown error
  console.error('ERROR 💥:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

module.exports = errorHandler;
