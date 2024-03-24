import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activate/:activationToken', authController.activate);
authRouter.post('/login', authController.login);

authRouter.get('/login', (req, res) => {
  const html = `
    <h1>Login page</h1>
  `;

  res.send(html);
});

authRouter.post('/logout', authController.logout);
