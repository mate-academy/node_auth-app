import express from 'express';
import { authController } from './auth.controller.js';
import { catchError } from '../../utils/catchError.js';

const { Router } = express;

const auth = Router();

auth.post('/register', catchError(authController.register));
auth.post('/login', catchError(authController.login));
auth.get('/activation/:activationToken', catchError(authController.activate));

export default auth;
