'use strict';

import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const userRouter = express.Router();

userRouter.use(authMiddleware);

userRouter.get('/profile', userController.getProfile);
userRouter.patch('/profile/name', userController.changeName);
userRouter.patch('/profile/password', userController.changePassword);
userRouter.patch('/profile/email', userController.changeEmail);

export default userRouter;
