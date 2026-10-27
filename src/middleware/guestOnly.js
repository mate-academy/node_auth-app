'use strict';

const passport = require('../config/passport');

// Реєстрація тільки для неавторизованих: якщо є валідний JWT — 403
const guestOnly = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error) {
      return next(error);
    }

    if (user) {
      return res.status(403).send({ message: 'You are already authenticated' });
    }

    return next();
  })(req, res, next);
};

// Для захищених маршрутів
const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = {
  guestOnly,
  requireAuth,
};
