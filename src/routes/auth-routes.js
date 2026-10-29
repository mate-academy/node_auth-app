'use strict';

const {
  createAccount,
  activateAccount,
  loginAccount,
  logoutAccount,
  getProfile,
  updateProfileName,
  renovateToken,
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
} = require('../controller/auth-controller');
const checkAuthHeader = require('../services/authentication');
const express = require('express');
const authRoutes = express.Router();

authRoutes.post('/register', createAccount);
authRoutes.get('/activate/:token', activateAccount);
authRoutes.post('/login', loginAccount);
authRoutes.post('/logout', checkAuthHeader, logoutAccount);
authRoutes.get('/profile', checkAuthHeader, getProfile);
authRoutes.patch('/profile/password', checkAuthHeader, changePassword);
authRoutes.patch('/profile', checkAuthHeader, updateProfileName);
authRoutes.post('/refresh', renovateToken);
authRoutes.post('/password-reset', requestPasswordReset);
authRoutes.post('/password-reset/confirm', confirmPasswordReset);

module.exports = {
  authRoutes,
};
