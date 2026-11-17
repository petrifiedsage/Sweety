const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required.', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    return next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token.', 401));
  }
}

module.exports = {
  authenticateToken,
};
