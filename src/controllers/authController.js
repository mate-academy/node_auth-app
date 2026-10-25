'use strict';

const authService = require('../services/authService');
const authValidator = require('../validators/authValidator');
const fields = require('../validators/fields');
const sessionUtils = require('../utils/session');
const authViews = require('../views/authViews');

function showRegister(req, res) {
  const view = { errors: [], values: {} };

  res.page(200, authViews.register(res.locals, view));
}

async function register(req, res) {
  const result = authValidator.validateRegistration(req.body);

  if (result.errors.length > 0) {
    const view = { errors: result.errors, values: result.values };

    res.page(422, authViews.register(res.locals, view));

    return;
  }

  await authService.register({
    name: result.values.name,
    email: result.values.email,
    password: result.password,
  });
  res.redirect('/register/sent');
}

function registerSent(req, res) {
  res.page(200, authViews.registerSent(res.locals));
}

async function resendActivation(req, res) {
  const email = fields.normEmail((req.body || {}).email);

  await authService.resendActivation(email);

  sessionUtils.setFlash(
    req,
    'info',
    'If that account is waiting for activation, a new email is on its way.',
  );
  res.redirect('/register/sent');
}

async function activate(req, res) {
  const user = await authService.activate(req.params.token);

  if (!user) {
    res.page(400, authViews.activationFailed(res.locals));

    return;
  }

  await sessionUtils.startSession(req, user);

  sessionUtils.setFlash(
    req,
    'success',
    'Your email was confirmed and your account is active. Welcome!',
  );
  res.redirect('/profile');
}

function showLogin(req, res) {
  const view = {
    errors: [],
    values: {},
    inactive: false,
  };

  res.page(200, authViews.login(res.locals, view));
}

async function login(req, res) {
  const data = req.body || {};
  const email = fields.normEmail(data.email);
  const password = fields.asText(data.password);
  const result = await authService.authenticate(email, password);

  if (result.status !== 'ok') {
    const inactive = result.status === 'inactive';
    const view = {
      errors: inactive ? [] : ['Invalid email or password.'],
      values: { email },
      inactive,
    };

    res.page(inactive ? 403 : 401, authViews.login(res.locals, view));

    return;
  }

  await sessionUtils.startSession(req, result.user);
  res.redirect('/profile');
}

async function logout(req, res) {
  await sessionUtils.endSession(req);
  sessionUtils.setFlash(req, 'success', 'You have been logged out.');
  res.redirect('/login');
}

module.exports = {
  showRegister,
  register,
  registerSent,
  resendActivation,
  activate,
  showLogin,
  login,
  logout,
};
