import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/auth/register', AuthController.register);

export { router };
