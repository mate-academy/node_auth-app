'use strict';

const authService = require('../services/authService');

// Loads the logged user (if any) into req.user.
async function loadCurrentUser(req, res, next) {
  const sess = req.session;

  req.user = null;

  if (sess.uid) {
    req.user = await authService.findSessionUser(sess.uid, sess.tokenVersion);

    if (!req.user) {
      delete sess.uid;
      delete sess.tokenVersion;
    }
  }

  next();
}

module.exports = loadCurrentUser;
