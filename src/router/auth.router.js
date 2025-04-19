import express from 'express';
import { authControllers } from '../controllers/auth.controllers.js';
import { catchError } from '../catchError.js';

export const router = new express.Router();

router.post('/registration', catchError(authControllers.registration));
router.get('/activate/:activationToken', catchError(authControllers.activate));
router.post('/login', catchError(authControllers.login));
router.get('/refresh', catchError(authControllers.refresh));
router.post('/logout', catchError(authControllers.logout));
