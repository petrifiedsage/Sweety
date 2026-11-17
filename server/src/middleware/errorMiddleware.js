const AppError = require('../utils/AppError');

function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const payload = {
      error: err.message,
      message: err.message,
    };
    if (err.details) {
      payload.details = err.details;
    }
    return res.status(err.statusCode).json(payload);
  }

  // Handle Prisma unique constraint violation
  if (err && err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate or conflicting record.',
      message: 'Duplicate or conflicting record.',
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal server error',
    message: 'Internal server error',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
