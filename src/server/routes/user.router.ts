import { Router } from 'express';

import { usersController } from '../controllers/users.controller.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = Router();

userRouter.post('/check', catchError(usersController.checkPassword));
userRouter.patch('/', catchError(usersController.changeUserData));
