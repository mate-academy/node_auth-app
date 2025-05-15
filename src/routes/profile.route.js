const { Router } = require('express');
const { profileController } = require('../controllers/profile.controller.js');
const { catchError } = require('../utils/catchError.js');

const profileRouter = Router();

profileRouter.get('/', catchError(profileController.getProfileInfo));
profileRouter.post('/changeName', catchError(profileController.changeName));

profileRouter.post(
  '/changePassword',
  catchError(profileController.changePassword),
);
profileRouter.post('/changeEmail', catchError(profileController.changeEmail));

module.exports = { profileRouter };
