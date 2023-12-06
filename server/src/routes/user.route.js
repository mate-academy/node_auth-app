'use strict';
import express from 'express';
export const userRouter = express.Router();
import {usersController} from '../controllers/users.controller.js';
import { isLoggedIn } from '../utils/isLoggedIn.js';

userRouter.get('/', isLoggedIn, usersController.getAll);
userRouter.get('/:id', isLoggedIn, usersController.getById);
userRouter.delete('/:id', isLoggedIn, usersController.deleteParticular);

userRouter.patch('/update-name', isLoggedIn, usersController.updateName);

userRouter.patch('/update-password', isLoggedIn, usersController.updatePassword);

userRouter.patch('/update-email', isLoggedIn, usersController.updateEmailRequest);

userRouter.patch('/set-new-email', usersController.setNewEmail);
