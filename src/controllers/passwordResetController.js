'use strict';

const authService = require('../services/authService');
const authValidator = require('../validators/authValidator');
const fields = require('../validators/fields');
const views = require('../views/passwordResetViews');

function showRequest(req, res) {
  res.page(200, views.request(res.locals));
}

async function request(req, res) {
  const email = fields.normEmail((req.body || {}).email);

  await authService.requestPasswordReset(email);
  res.redirect('/password-reset/sent');
}

function sent(req, res) {
  res.page(200, views.sent(res.locals));
}

function success(req, res) {
  res.page(200, views.success(res.locals));
}

async function showForm(req, res) {
  const { token } = req.params;

  if (!(await authService.isResetTokenValid(token))) {
    res.page(400, views.invalid(res.locals));

    return;
  }

  res.page(200, views.form(res.locals, { token, errors: [] }));
}

async function reset(req, res) {
  const { token } = req.params;

  if (!(await authService.isResetTokenValid(token))) {
    res.page(400, views.invalid(res.locals));

    return;
  }

  const result = authValidator.validateNewPassword(req.body);

  if (result.errors.length > 0) {
    const view = { token, errors: result.errors };

    res.page(422, views.form(res.locals, view));

    return;
  }

  const done = await authService.resetPassword(token, result.password);

  if (!done) {
    res.page(400, views.invalid(res.locals));

    return;
  }

  res.redirect('/password-reset/success');
}

module.exports = {
  showRequest,
  request,
  sent,
  success,
  showForm,
  reset,
};
