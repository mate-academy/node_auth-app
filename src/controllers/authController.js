'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { PASSWORD_RULES } = require('../utils/passwordRules');
const toPublicUser = require('../utils/publicUser');

function createAuthController(authService, sessionService) {
  return {
    passwordRules(req, res) {
      res.json({ rules: PASSWORD_RULES });
    },

    register: asyncHandler(async (req, res) => {
      await authService.register(req.body);
      res.status(201).json({
        message: 'Registration successful. Please activate your email.',
        passwordRules: PASSWORD_RULES,
      });
    }),

    activate: asyncHandler(async (req, res) => {
      const user = await authService.activate(req.params.token);

      await sessionService.createSession(user, res);
      res.json({
        message: 'Account activated successfully',
        redirectTo: '/profile',
        user: toPublicUser(user),
      });
    }),

    login: asyncHandler(async (req, res) => {
      const user = await authService.login(req.body);

      await sessionService.createSession(user, res);
      res.json({
        redirectTo: '/profile',
        user: toPublicUser(user),
      });
    }),

    logout: asyncHandler(async (req, res) => {
      await sessionService.logout(req, res);
      res.json({ redirectTo: '/login' });
    }),
  };
}

module.exports = createAuthController;
