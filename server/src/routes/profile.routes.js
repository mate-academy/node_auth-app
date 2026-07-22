'use strict';

const express = require('express');

const { profileController } = require('../controllers/profile.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const profileRouter = express.Router();

profileRouter.get(
  '/email/confirm/:token',
  profileController.confirmEmailChange,
);

profileRouter.use(authMiddleware);

profileRouter.get('/', profileController.getProfile);
profileRouter.patch('/name', profileController.updateName);
profileRouter.patch('/password', profileController.updatePassword);
profileRouter.patch('/email', profileController.requestEmailChange);

module.exports = { profileRouter };
