'use strict';

const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { User } = require('../models/User.model');
const { changePassword } = require('../controllers/passwordChange');
const { requestEmailChange } = require('../controllers/emailChangeRequest');
const { confirmEmailChange } = require('../controllers/emailChangeConfirm');

const profileRouter = express.Router();

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zbyt wiele prób zmiany hasła. Spróbuj za 15 minut.',
});

const emailChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zbyt wiele prób zmiany adresu. Spróbuj za 15 minut.',
});

profileRouter.post('/profile/name', async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const user = await User.findByPk(req.session.userId);

    if (!user || !user.isActivated) {
      return req.session.destroy((error) => {
        if (error) {
          return next(error);
        }

        return res.redirect('/login');
      });
    }

    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name || name.length > 255) {
      return res.status(400).render('profile', {
        user: {
          name: user.name,
          email: user.email,
        },
        error: 'Imię musi mieć od 1 do 255 znaków.',
      });
    }

    await user.update({ name });

    return res.redirect(303, '/profile');
  } catch (error) {
    return next(error);
  }
});

profileRouter.post('/profile/password', passwordChangeLimiter, changePassword);

profileRouter.post('/profile/email', emailChangeLimiter, requestEmailChange);

profileRouter.get('/profile/email/sent', async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const user = await User.findByPk(req.session.userId);

    if (!user || !user.isActivated) {
      return req.session.destroy((error) => {
        if (error) {
          return next(error);
        }

        return res.redirect('/login');
      });
    }

    return res.render('message', {
      title: 'Potwierdź nowy adres',
      message:
        'Wysłaliśmy link na nowy adres e-mail. ' +
        'Sprawdź także Spam. Otwórz link w przeglądarce, ' +
        'w której jesteś zalogowany do aplikacji.',
    });
  } catch (error) {
    return next(error);
  }
});

profileRouter.get('/confirm-email-change', confirmEmailChange);

module.exports = { profileRouter };
