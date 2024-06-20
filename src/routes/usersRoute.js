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
const { userRoute } = require('../constants/routes');

const usersRoute = express.Router();

usersRoute.get(
  userRoute.googleLogin,
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    accessType: 'offline',
    prompt: 'consent',
  }),
);

usersRoute.get(
  userRoute.googleLoginCB,
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/profile',
  }),
);

usersRoute.post(
  userRoute.login,
  passport.authenticate('custom', { failureRedirect: '/login' }),
  httpLoginUser,
);
usersRoute.post(userRoute.logout, httpLogoutUser);

usersRoute.post(
  userRoute.signup,
  passport.authenticate('custom', { failureRedirect: '/signUp' }),
  httpSignupUser,
);
usersRoute.get(userRoute.activate, httpActivateUser);
usersRoute.get(userRoute.refresh, httpRefreshUserToken);
usersRoute.get(userRoute.authStatus, httpCheckAuthStatus);
usersRoute.put(userRoute.restore, httpUserValidation);
usersRoute.get(userRoute.restoreActivationToken, httpRestorePassword);
usersRoute.put(userRoute.restoreNewPassword, httpChangePassword);

module.exports = { usersRoute };
