'use strict';

const { Router } = require('express');

const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  nameValidator,
  passwordValidator,
  emailValidator,
} = require('../validators/profileValidators');

const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get('/', profileController.getProfile);

profileRouter.patch(
  '/name',
  nameValidator,
  validate,
  profileController.updateName,
);

profileRouter.patch(
  '/password',
  passwordValidator,
  validate,
  profileController.updatePassword,
);

profileRouter.patch(
  '/email',
  emailValidator,
  validate,
  profileController.updateEmail,
);

module.exports = profileRouter;
