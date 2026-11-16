'use strict';

import 'dotenv/config';
import { confirmEmail } from './pages/confirm-email.js';
import { register } from './pages/register.js';
import { changePassword } from './pages/change-password.js';

import { login } from './pages/login.js';

import { home } from './pages/home.js';
import {
  controllerRegister,
  activate,
  loginSystem,
} from './controllers/auth.controller.js';
import { client } from './db.js';

import express from 'express';

const app = express();

app.use(express.json());
app.use(express.static('src/public'));
app.use(express.urlencoded({ extended: true }));
await client.sync({ alter: true });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`server, port ${port}`);
});

app.get('/', (req, res) => {
  res.send(home);
});

app.post('/register', controllerRegister);

app.get('/register', (req, res) => {
  res.send(register);
});

app.get('/login', (req, res) => {
  res.send(login);
});

app.get('/change-password', (req, res) => {
  res.send(changePassword);
});

app.post('/enter', loginSystem);

app.get('/confirm-email', (req, res) => {
  res.send(confirmEmail);
});

export const authRouter = new express.Router();

app.get('/activation/:token', activate);
