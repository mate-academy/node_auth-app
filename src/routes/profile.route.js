import express from 'express';
import { profileController } from '../controllers/profile.controller.js';

export const profileRouter = express.Router();

profileRouter.get('/profile', profileController.getProfile);
profileRouter.post('/profile/update', profileController.updateProfile);
