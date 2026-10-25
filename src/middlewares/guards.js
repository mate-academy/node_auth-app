'use strict';

function guestOnly(req, res, next) {
  if (req.user) {
    res.redirect('/profile');

    return;
  }

  next();
}

function authOnly(req, res, next) {
  if (!req.user) {
    res.redirect('/login');

    return;
  }

  next();
}

module.exports = {
  guestOnly,
  authOnly,
};
