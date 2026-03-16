'use strict';

const authService = require('../services/auth.service');

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/activate/:token
 * Activates the account and returns a JWT so the user is logged in immediately.
 */
function activate(req, res, next) {
  try {
    const result = authService.activate(req.params.token);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Always responds 200 to prevent email enumeration.
 */
async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/validate-reset/:token
 * Lets the frontend verify a reset token
 * is still valid before rendering the form.
 */
function validateResetToken(req, res, next) {
  try {
    const result = authService.validateResetToken(req.params.token);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password/:token
 * Body: { password, confirmation }
 */
async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.params.token, req.body);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Authenticated — instructs the client to discard its token.
 */
function logout(req, res, next) {
  try {
    const result = authService.logout();

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  activate,
  login,
  forgotPassword,
  validateResetToken,
  resetPassword,
  logout,
};
