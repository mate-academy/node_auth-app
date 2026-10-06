'use strict';

const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { requestPasswordReset } = require('../controllers/passwordResetRequest');
const {
  showResetForm,
  resetPassword,
} = require('../controllers/passwordReset');

const passwordResetRouter = express.Router();

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zbyt wiele próśb o reset hasła. Spróbuj za 15 minut.',
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zbyt wiele prób zmiany hasła. Spróbuj za 15 minut.',
});

function onlyGuests(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  return next();
}

passwordResetRouter.get('/password-reset', onlyGuests, (req, res) => {
  res.render('password-reset', {
    error: null,
    email: '',
  });
});

passwordResetRouter.post(
  '/password-reset',
  onlyGuests,
  requestLimiter,
  requestPasswordReset,
);

passwordResetRouter.get('/password-reset/sent', onlyGuests, (req, res) => {
  res.render('message', {
    title: 'Sprawdź pocztę',
    message:
      'Jeśli podany adres należy do aktywnego konta, ' +
      'wyślemy link do zmiany hasła. Sprawdź także folder Spam.',
  });
});

passwordResetRouter.get('/password-reset/success', onlyGuests, (req, res) => {
  res.render('message', {
    title: 'Hasło zostało zmienione',
    message: 'Możesz teraz zalogować się nowym hasłem.',
  });
});

passwordResetRouter.get('/reset-password', onlyGuests, showResetForm);

passwordResetRouter.post(
  '/reset-password',
  onlyGuests,
  resetLimiter,
  resetPassword,
);

module.exports = { passwordResetRouter };
