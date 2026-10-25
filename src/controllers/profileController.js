'use strict';

const profileService = require('../services/profileService');
const profileValidator = require('../validators/profileValidator');
const sessionUtils = require('../utils/session');
const profileViews = require('../views/profileViews');

function renderProfile(res, errors, values, httpStatus) {
  const view = { errors, values };

  res.page(httpStatus, profileViews.index(res.locals, view));
}

function show(req, res) {
  renderProfile(res, {}, {}, 200);
}

async function updateName(req, res) {
  const input = profileValidator.validateName(req.body);

  if (input.errors.length > 0) {
    renderProfile(res, { name: input.errors }, { name: input.name }, 422);

    return;
  }

  await profileService.updateName(req.user, input.name);
  sessionUtils.setFlash(req, 'success', 'Name updated.');
  res.redirect('/profile');
}

async function updatePassword(req, res) {
  const input = profileValidator.validatePasswordChange(req.body);
  const oldValid = await profileService.isPasswordValid(
    req.user,
    input.oldPassword,
  );
  const errors = oldValid ? [] : ['Current password is incorrect.'];

  errors.push(...input.errors);

  if (errors.length > 0) {
    renderProfile(res, { password: errors }, {}, 422);

    return;
  }

  await profileService.changePassword(req.user, input.password);
  req.session.tokenVersion = req.user.tokenVersion; // keeps this session

  sessionUtils.setFlash(
    req,
    'success',
    'Password changed. Other devices were logged out.',
  );
  res.redirect('/profile');
}

async function updateEmail(req, res) {
  const input = profileValidator.validateEmailChange(req.body, req.user);
  const passwordValid = await profileService.isPasswordValid(
    req.user,
    input.password,
  );
  const errors = passwordValid ? [] : ['Password is incorrect.'];

  errors.push(...input.errors);

  if (errors.length === 0 && (await profileService.isEmailTaken(input.email))) {
    errors.push('That email cannot be used.');
  }

  if (errors.length > 0) {
    const values = {
      email: input.email,
      emailConfirmation: input.confirmation,
    };

    renderProfile(res, { email: errors }, values, 422);

    return;
  }

  await profileService.changeEmail(req.user, input.email);

  sessionUtils.setFlash(
    req,
    'success',
    'Email changed. We notified your old address.',
  );
  res.redirect('/profile');
}

module.exports = {
  show,
  updateName,
  updatePassword,
  updateEmail,
};
