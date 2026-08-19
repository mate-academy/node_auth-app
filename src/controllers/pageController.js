'use strict';

const asyncHandler = require('../utils/asyncHandler');
const {
  renderForgotPasswordPage,
  renderLoginPage,
  renderMessagePage,
  renderProfilePage,
  renderRegisterPage,
  renderResetPasswordPage,
} = require('../views/html');

function createPageController(authService, profileService, sessionService) {
  return {
    home(req, res) {
      res.redirect(302, req.user ? '/profile' : '/login');
    },

    showRegister(req, res) {
      res.send(renderRegisterPage());
    },

    register: asyncHandler(async (req, res) => {
      try {
        await authService.register(req.body);
        res.redirect(303, '/check-email?type=activation');
      } catch (error) {
        res
          .status(error.statusCode || 400)
          .send(renderRegisterPage(error.message));
      }
    }),

    showLogin(req, res) {
      res.send(renderLoginPage());
    },

    login: asyncHandler(async (req, res) => {
      try {
        const user = await authService.login(req.body);

        await sessionService.createSession(user, res);
        res.redirect(303, '/profile');
      } catch (error) {
        res
          .status(error.statusCode || 400)
          .send(renderLoginPage(error.message));
      }
    }),

    activate: asyncHandler(async (req, res) => {
      const user = await authService.activate(req.params.token);

      await sessionService.createSession(user, res);
      res.redirect(302, '/profile');
    }),

    logout: asyncHandler(async (req, res) => {
      await sessionService.logout(req, res);
      res.redirect(303, '/login');
    }),

    showForgot(req, res) {
      res.send(renderForgotPasswordPage());
    },

    forgot: asyncHandler(async (req, res) => {
      try {
        await authService.requestPasswordReset(req.body.email);
        res.redirect(303, '/check-email?type=reset');
      } catch (error) {
        res
          .status(error.statusCode || 400)
          .send(renderForgotPasswordPage(error.message));
      }
    }),

    showReset(req, res) {
      res.send(renderResetPasswordPage(req.params.token));
    },

    reset: asyncHandler(async (req, res) => {
      try {
        const user = await authService.resetPassword(
          req.params.token,
          req.body,
        );

        await sessionService.revokeAllForUser(user.id);
        res.redirect(303, '/reset-password-success');
      } catch (error) {
        res
          .status(error.statusCode || 400)
          .send(renderResetPasswordPage(req.params.token, error.message));
      }
    }),

    resetSuccess(req, res) {
      res.send(
        renderMessagePage(
          'Password changed',
          'Your password was reset successfully.',
          '/login',
          'Login',
        ),
      );
    },

    checkEmail(req, res) {
      const message =
        req.query.type === 'reset'
          ? 'If the account exists, a password reset email was sent.'
          : 'We sent an activation email. Follow the link to continue.';

      res.send(
        renderMessagePage('Check your email', message, '/login', 'Login'),
      );
    },

    profile(req, res) {
      res.send(renderProfilePage(req.user));
    },

    updateName: asyncHandler(async (req, res) => {
      await profileService.updateName(req.user, req.body.name);
      res.redirect(303, '/profile');
    }),

    updatePassword: asyncHandler(async (req, res) => {
      await profileService.updatePassword(req.user, req.body);
      await sessionService.createSession(req.user, res);
      res.redirect(303, '/profile');
    }),

    updateEmail: asyncHandler(async (req, res) => {
      await profileService.updateEmail(req.user, req.body);
      res.redirect(303, '/profile');
    }),
  };
}

module.exports = createPageController;
