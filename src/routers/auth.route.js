import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/', authController.register);

authRouter.get('/:activationToken', authController.activate);
