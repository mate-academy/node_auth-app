import express from 'express';
import { resetController } from '../controllers/resetPassword.controller.js';

export const resetPasswordRouter = new express.Router();

resetPasswordRouter.get('/', resetController.resetQuerryGet);
resetPasswordRouter.post('/', resetController.resetQuerryPost);

resetPasswordRouter.get('/:id', resetController.resetActionGet);
resetPasswordRouter.post('/:id', resetController.resetActionPost);
