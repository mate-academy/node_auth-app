'use strict';

const express = require('express');

const {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/auth.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const { guestMiddleware } = require('../middlewares/guest.middleware');

const { catchError } = require('../utils/catchError');

const router = express.Router();

router.post('/register', guestMiddleware, catchError(register));
router.get('/activate/:token', guestMiddleware, catchError(activate));
router.post('/login', guestMiddleware, catchError(login));
router.post('/refresh', catchError(refresh));
router.post('/logout', authMiddleware, catchError(logout));

router.post(
  '/reset-password',
  guestMiddleware,
  catchError(requestPasswordReset),
);

router.post(
  '/reset-password/:token',
  guestMiddleware,
  catchError(resetPassword),
);

module.exports = {
  authRouter: router,
};
