const express = require('express');
const profileController = require('../controllers/profile.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/profile', authMiddleware, profileController.getProfile);
router.patch('/profile/name', authMiddleware, profileController.updateName);

router.patch(
  '/profile/password',
  authMiddleware,
  profileController.changePassword,
);

router.post(
  '/profile/email',
  authMiddleware,
  profileController.requestEmailChange,
);

router.get('/confirm-email/:token', profileController.confirmEmailChange);

module.exports = {
  router,
};
