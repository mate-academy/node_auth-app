import express from 'express';
import { userController } from '../controllers/user.controller.js';

export const userRoute = express.Router();

userRoute.get('/', userController.getAllActivated);
