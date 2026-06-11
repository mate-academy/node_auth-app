'use strict';

const { Router } = require('express');
const { profileController } = require('./profile.controller.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.patch('/', profileController.updateName);
profileRouter.patch('/password', profileController.updatePassword);
profileRouter.patch('/email', profileController.updateEmail);

module.exports = { profileRouter };
