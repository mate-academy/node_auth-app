'use strict';

const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { User } = require('../models/User.model');
const { activate } = require('../controllers/activation');
const { verifyPassword } = require('../utils/password');

const accountRouter = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zbyt wiele prób logowania. Spróbuj za 15 minut.',
});

accountRouter.get('/activate', activate);

accountRouter.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  return res.render('login', {
    error: null,
    email: '',
  });
});

accountRouter.post('/login', loginLimiter, async (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  const body = req.body || {};
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  const invalidCredentials = () => {
    return res.status(400).render('login', {
      error: 'Nieprawidłowy adres e-mail lub hasło.',
      email,
    });
  };

  if (!email || email.length > 254 || typeof body.password !== 'string') {
    return invalidCredentials();
  }

  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return invalidCredentials();
    }

    const passwordMatches = await verifyPassword(
      body.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return invalidCredentials();
    }

    if (!user.isActivated) {
      return res.status(403).render('login', {
        error: 'Potwierdź adres e-mail, klikając link aktywacyjny.',
        email,
      });
    }

    return req.session.regenerate((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      req.session.userId = user.id;

      return req.session.save((saveError) => {
        if (saveError) {
          return next(saveError);
        }

        return res.redirect('/profile');
      });
    });
  } catch (error) {
    return next(error);
  }
});

accountRouter.post('/logout', (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  return req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie('auth.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.redirect('/login');
  });
});

accountRouter.get('/profile', async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'isActivated'],
    });

    if (!user || !user.isActivated) {
      return req.session.destroy((error) => {
        if (error) {
          return next(error);
        }

        return res.redirect('/login');
      });
    }

    return res.render('profile', {
      user: user.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = { accountRouter };
