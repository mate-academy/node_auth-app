'use strict';

const { profileService } = require('../services/profile.service');
const { normalizeUser } = require('../utils/normalizeUser');

async function getProfile(req, res) {
  res.status(200).json({
    user: normalizeUser(req.user),
  });
}

async function changeName(req, res) {
  const user = await profileService.changeName(req.user, req.body.name);

  res.status(200).json({
    user,
    message: 'Name has been changed successfully',
  });
}

async function changePassword(req, res) {
  const user = await profileService.changePassword(req.user, req.body);

  res.status(200).json({
    user,
    message: 'Password has been changed successfully',
  });
}

async function requestEmailChange(req, res) {
  await profileService.requestEmailChange(req.user, req.body);

  res.status(200).json({
    message: 'Confirmation email has been sent to the new address',
  });
}

async function confirmEmailChange(req, res) {
  const user = await profileService.confirmEmailChange(req.params.token);

  res.status(200).json({
    user,
    message: 'Email has been changed successfully',
  });
}

module.exports = {
  getProfile,
  changeName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
