'use strict';

const { db } = require('../models/db');

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    res.redirect('/login');

    return;
  }

  const user = db.usersById.get(req.session.userId);

  if (!user) {
    req.session.destroy(() => {
      res.redirect('/login');
    });

    return;
  }

  req.user = user;
  next();
}

function requireGuest(req, res, next) {
  if (req.session.userId) {
    res.redirect('/profile');

    return;
  }

  next();
}

module.exports = { requireAuth, requireGuest };
