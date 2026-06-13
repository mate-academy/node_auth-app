const express = require('express');
const profileController = require('../controllers/profileController.js');
const { isAuthorize } = require('./../middleware/isAuthorizeMiddleware.js');

const profileRouter = express.Router();

profileRouter.get('/', isAuthorize, profileController.profilePage);
profileRouter.get('/logout', isAuthorize, profileController.logout);

profileRouter.get(
  '/change-email/:token',
  isAuthorize,
  profileController.confirmChangeEmail,
);

profileRouter.patch('/change-name', isAuthorize, profileController.changeName);

profileRouter.patch(
  '/change-email',
  isAuthorize,
  profileController.changeEmail,
);

profileRouter.patch(
  '/change-password',
  isAuthorize,
  profileController.changePassword,
);

module.exports = {
  profileRouter,
};
