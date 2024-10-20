import express from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { catchError } from '../utils/catchError.js';

export const profileRoute = new express.Router();

profileRoute.post('/rename', catchError(ProfileController.rename));

profileRoute.post(
  '/changePassword',
  catchError(ProfileController.changePassword),
);
profileRoute.post('/changeEmail', catchError(ProfileController.changeEmail));

profileRoute.post(
  '/changeEmailConfirm',
  catchError(ProfileController.confirmEmailChange),
);
