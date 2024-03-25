'use strict';
import 'dotenv/config';
import express from 'express';
import { usersRouter } from './routes/users.route.js';
import { authRouter } from './routes/auth.route.js';
import { resetPasswordRouter } from './routes/resetPassword.route.js';
import { profileRouter } from './routes/profile.route.js';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use('/users', usersRouter);
app.use('/authorization', authRouter);
app.use('/resetPassword', resetPasswordRouter);
app.use('/profile', profileRouter);

app.use((req, res) => {
  res.status(404).send('Error 404: Page not found');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server running on ${PORT}`);
});
