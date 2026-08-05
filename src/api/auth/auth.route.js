import express from 'express';
const { Router } = express;
import { authController } from './auth.controller.js';

const auth = Router();

auth.post('/register', authController.register);
auth.post('/login', authController.login);
auth.get('/activation/:activationToken', authController.activate);

export default auth;
