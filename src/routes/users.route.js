import express from 'express';
import { usersController } from './../controllers/users.controller.js';
export const usersRouter = new express.Router();

usersRouter.get('/', usersController.getAllUsers);
