import express from 'express';

import { authController } from '../controllers/authController.js';
import { loginCheckToken } from '../middlewares/loginCheckToken.js';
import { changePass } from '../middlewares/changePass.js';
import { mailMiddleware } from '../middlewares/changeMail.js';

export const authRouter = express.Router();

authRouter.post('/registration', express.json(), authController.register);
authRouter.get('/activation/:token', authController.activate);

authRouter.post(
  '/login',
  express.json(),
  loginCheckToken,
  authController.login,
);
authRouter.post('/signout', express.json(), authController.signOut);

authRouter.post(
  // this route is intended to be activated after the first
  '/password/:email',
  express.json(),
  changePass,
  authController.passwordChange,
);

authRouter.post(
  //  this route have a same situation as in 'password' routers
  '/email/:userId/:newEmail',
  express.json(),
  mailMiddleware,
  authController.changeMail,
);
