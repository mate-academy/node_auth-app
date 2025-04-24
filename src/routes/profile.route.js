const express = require('express');
const { profileController } = require('../controllers/profile.controller.js');
const { isAuth } = require('../middlewares/isAuthMiddleware.js');

const profileRoute = new express.Router();

profileRoute.put('/change-name', isAuth, profileController.changeName);
profileRoute.put('/change-password', isAuth, profileController.changePass);
profileRoute.post('/change-mail', isAuth, profileController.changeMail);

profileRoute.put(
  '/change-mail/:resetToken',
  isAuth,
  profileController.applyNewMail,
);

module.exports = { profileRoute };
