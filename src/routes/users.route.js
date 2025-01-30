import express from 'express';
import { usersController } from './../controllers/users.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
export const usersRouter = new express.Router();

usersRouter.get('/', authMiddleware, catchError(usersController.getAllUsers));
