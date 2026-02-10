'use strict';

function requireAuth(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

function requireNoAuth(req, res, next) {
  if (!req.session.userId) {
    return next();
  }
  res.redirect('/profile');
}

module.exports = {
  requireAuth,
  requireNoAuth,
};
