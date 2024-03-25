import express from 'express';
import { profileController } from '../controllers/profile.controller.js';

export const profileRouter = new express.Router();

profileRouter.get('/:id', profileController.get);

profileRouter.get('/updateUsername/:id', profileController.updateUsernamePage);
profileRouter.post('/updateUsername/:id', profileController.updateUsernamePost);

profileRouter.get('/updatePassword/:id', profileController.updatePasswordPage);
profileRouter.post('/updatePassword/:id', profileController.updatePasswordPost);

profileRouter.get(
  '/updateEmail/passwordPage/:id',
  profileController.updateEmailPasswordPage,
);

profileRouter.post(
  '/updateEmail/passwordPost/:id',
  profileController.updateEmailPasswordPost,
);

profileRouter.get(
  '/updateEmail/emailPage/:id',
  profileController.updateEmailEmailPage,
);

profileRouter.post(
  '/updateEmail/emailPost/:id',
  profileController.updateEmailEmailPost,
);
