const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { validateRegisterInput, validateLoginInput } = require('../validators/authValidator');

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
}

async function registerUser(payload) {
  const { name, email, password } = validateRegisterInput(payload);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
    },
  });

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

async function loginUser(payload) {
  const { email, password } = validateLoginInput(payload);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('Authentication required.', 401);
  }

  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  sanitizeUser,
  generateToken,
};
