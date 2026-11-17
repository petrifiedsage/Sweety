const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_CAPITAL_REGEX = /[A-Z]/;
const HAS_NUMBER_REGEX = /[0-9]/;

function validateRegisterInput(body = {}) {
  const { name, email, password } = body;

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new AppError('Full name is required.', 400);
  }

  if (name.trim().length > 100) {
    throw new AppError('Full name cannot exceed 100 characters.', 400);
  }

  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new AppError('Email address is required.', 400);
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    throw new AppError('Please provide a valid email address.', 400);
  }

  if (typeof password !== 'string' || password.length === 0) {
    throw new AppError('Password is required.', 400);
  }

  if (!HAS_CAPITAL_REGEX.test(password) || !HAS_NUMBER_REGEX.test(password)) {
    throw new AppError(
      'Password must contain at least one capital letter and one number.',
      400
    );
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  };
}

function validateLoginInput(body = {}) {
  const { email, password } = body;

  if (
    typeof email !== 'string' ||
    email.trim().length === 0 ||
    typeof password !== 'string' ||
    password.length === 0
  ) {
    throw new AppError('Email and password are required.', 400);
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    throw new AppError('Please provide a valid email address.', 400);
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
