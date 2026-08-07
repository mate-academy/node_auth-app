'use strict';

const express = require('express');

const {
  getProfile,
  changeName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
} = require('../controllers/profile.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');

const { catchError } = require('../utils/catchError');

const router = express.Router();

router.get('/profile', authMiddleware, catchError(getProfile));
router.patch('/profile/name', authMiddleware, catchError(changeName));
router.patch('/profile/password', authMiddleware, catchError(changePassword));
router.patch('/profile/email', authMiddleware, catchError(requestEmailChange));
router.get('/confirm-email/:token', catchError(confirmEmailChange));

module.exports = {
  profileRouter: router,
};
