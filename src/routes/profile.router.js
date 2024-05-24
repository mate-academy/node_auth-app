import express from 'express';
import { catchError } from '../utils/catchError.js';
import profileController from '../controllers/profile.controller.js';

export const profileRouter = express.Router();

profileRouter.get('/', catchError(profileController.get));
profileRouter.put('/name', catchError(profileController.updateName));
profileRouter.put('/password', catchError(profileController.updatePassword));
