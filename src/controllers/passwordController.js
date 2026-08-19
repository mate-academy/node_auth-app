'use strict';

const asyncHandler = require('../utils/asyncHandler');

function createPasswordController(authService, sessionService) {
  return {
    forgotPassword: asyncHandler(async (req, res) => {
      await authService.requestPasswordReset(req.body.email);

      res.json({
        message: 'If the email is registered, a reset link has been sent.',
        redirectTo: '/check-email?type=reset',
      });
    }),

    resetPassword: asyncHandler(async (req, res) => {
      const user = await authService.resetPassword(req.params.token, req.body);

      await sessionService.revokeAllForUser(user.id);

      res.json({
        message: 'Password reset successfully',
        redirectTo: '/reset-password-success',
      });
    }),
  };
}

module.exports = createPasswordController;
