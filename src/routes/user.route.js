/* eslint-disable no-console */
import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { Token } from '../models/Token.js';

export const userRouter = new express.Router();

userRouter.get('/', userController.getAll);

userRouter.get('/tokens', async (req, res) => {
  try {
    const tokens = await Token.findAll();

    res.send(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);

    res.send(error);
  }
});

userRouter.get('/profile', (req, res) => {
  const html = `
    <h1>Profile</h1>
  `;

  res.send(html);
});
