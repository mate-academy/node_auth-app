const express = require('express');
const profileController = require('../controllers/profileController.js');

const profileRouter = express.Router();

profileRouter.get('/', profileController.profilePage);
profileRouter.get('/logout', profileController.logout);

profileRouter.get('/change-email/:token', profileController.confirmChangeEmail);
profileRouter.patch('/change-email', profileController.changeEmail);

profileRouter.patch('/change-name', profileController.changeName);
profileRouter.patch('/change-password', profileController.changePassword);

module.exports = {
  profileRouter,
};
