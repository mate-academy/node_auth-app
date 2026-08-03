const { Router } = require('express');
const authController = require('../controllers/auth.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = Router();

router.post('/registration', authController.registration);
router.get('/activation/:email/:token', authController.activate);
router.post('/login', authController.login);

router.get(
  '/profile',
  authMiddleware.requestValidation,
  authController.profile,
);

router.post('/logout', authMiddleware.requestValidation, authController.logout);
router.post('/reset-password/request', authController.resetPasswordRequest);

router.get(
  '/reset-password/:email/:resetPasswordToken',
  authController.validateResetPasswordToken,
);

router.post('/reset-password', authController.resetPassword);

router.post(
  '/profile/name',
  authMiddleware.requestValidation,
  authController.nameChange,
);

router.post(
  '/profile/password',
  authMiddleware.requestValidation,
  authController.passwordChange,
);

router.post(
  '/profile/email',
  authMiddleware.requestValidation,
  authController.emailChange,
);

router.get(
  '/change-email/:pendingEmail/:emailChangeToken',
  authController.confirmEmailChange,
);

module.exports = router;
