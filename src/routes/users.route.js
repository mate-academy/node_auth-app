import express from 'express';
import { usersController } from './../controllers/users.controller.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
export const usersRouter = new express.Router();

usersRouter.get('/', authMiddleware, usersController.getAllUsers);
