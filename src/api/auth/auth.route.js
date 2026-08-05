import express from 'express';
const { Router } = express;
import * as authController from './auth.controller.js';

const auth = Router();

auth.post('/register', authController.register);
auth.post('/login', authController.login);
auth.post('/activate/:id', authController.activate);

export default auth;
