import express from 'express';
import { userController } from '../controllers/user.controller.js';

export const userRoute = new express.Router();

userRoute.get('/', userController.getAllUsers);
