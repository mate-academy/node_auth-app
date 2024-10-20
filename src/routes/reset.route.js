import express from 'express';
import { resetController } from '../controllers/reset.controller.js';
import { catchError } from '../utils/catchError.js';

export const resetRoute = new express.Router();

resetRoute.post('/requestReset', catchError(resetController.requestReset));
resetRoute.post('/resetPassword', catchError(resetController.resetPassword));
