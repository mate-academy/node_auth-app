'use strict';

const userService = require('../services/user.service');

/**
 * GET /api/user/profile
 * Returns the authenticated user's public profile.
 */
function getProfile(req, res, next) {
  try {
    const result = userService.getProfile(req.userId);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/user/name
 * Body: { name }
 */
function updateName(req, res, next) {
  try {
    const result = userService.updateName(req.userId, req.body);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/user/password
 * Body: { currentPassword, newPassword, confirmation }
 */
async function changePassword(req, res, next) {
  try {
    const result = await userService.changePassword(req.userId, req.body);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/user/request-email-change
 * Body: { password, newEmail }
 * Sends a confirmation link to the new address
 * and a notification to the old one.
 */
async function requestEmailChange(req, res, next) {
  try {
    const result = await userService.requestEmailChange(req.userId, req.body);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/user/confirm-email-change/:token
 * Called when the user clicks the link sent to their new inbox.
 */
function confirmEmailChange(req, res, next) {
  try {
    const result = userService.confirmEmailChange(req.userId, req.params.token);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
