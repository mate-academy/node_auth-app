'use strict';

// Middleware для перевірки автентифікації
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash('error', 'Будь ласка, увійдіть до системи');
    res.redirect('/auth/login');
  }
};

// Middleware для перевірки, що користувач НЕ автентифікований
const isNotAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    res.redirect('/profile');
  }
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
};
