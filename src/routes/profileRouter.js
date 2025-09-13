import express from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { isAuth } from '../midlewares/isAuthenticated.js';

export const profileRouter = express.Router();

profileRouter.get('/', isAuth, profileController.getProfile);
