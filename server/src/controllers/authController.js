const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json({
      message: 'Registration successful.',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    return res.status(200).json({
      message: 'Login successful.',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  me,
};
