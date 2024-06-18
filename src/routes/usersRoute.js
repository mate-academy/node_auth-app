const express = require('express');
const {
  httpSignupUser,
  httpActivateUser,
  httpLoginUser,
  httpLogoutUser,
  httpRefreshUserToken,
  httpCheckAuthStatus,
  httpUserValidation,
  httpRestorePassword,
  httpChangePassword,
  passport,
} = require('../controllers/users.controller');

const usersRoute = express.Router();

usersRoute.get(
  '/login/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    accessType: 'offline',
    prompt: 'consent',
  }),
);

usersRoute.get(
  '/login/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/profile',
  }),
);

usersRoute.post(
  '/login',
  passport.authenticate('custom', { failureRedirect: '/login' }),
  httpLoginUser,
);
usersRoute.post('/logout', httpLogoutUser);

usersRoute.post(
  '/signUp',
  passport.authenticate('custom', { failureRedirect: '/signUp' }),
  httpSignupUser,
);
usersRoute.get('/activate/:activationToken', httpActivateUser);
usersRoute.get('/refresh', httpRefreshUserToken);
usersRoute.get('/auth/status', httpCheckAuthStatus);
usersRoute.put('/restore', httpUserValidation);
usersRoute.get('/restore/:activationToken', httpRestorePassword);
usersRoute.put('/restore/newpassword', httpChangePassword);

module.exports = { usersRoute };
