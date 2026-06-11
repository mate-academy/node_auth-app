'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./api/auth.router.js');
const { usersRouter } = require('./api/users.router.js');
const { profileRouter } = require('./api/profile.router.js');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/profile', profileRouter);

app.use((req, res) => res.sendStatus(404));

module.exports = { app };
