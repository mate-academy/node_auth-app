'use strict';

import express from 'express';
import { usersController } from "../controllers/users.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {catchError} from "../utils/catchError.js";


export const usersRouter = new express.Router();

usersRouter.get('/', authMiddleware, usersController.getAllActivated);
usersRouter.patch('/email', authMiddleware, catchError(usersController.changeEmail));
