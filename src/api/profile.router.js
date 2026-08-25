'use strict';

const express = require('express');

const { profileController } = require('./profile.controller.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const profileRouter = express.Router();

profileRouter.use(authMiddleware);

profileRouter.get('/', profileController.get);
profileRouter.patch('/name', profileController.updateName);
profileRouter.patch('/password', profileController.updatePassword);
profileRouter.post('/email', profileController.requestEmailChange);

module.exports = { profileRouter };
