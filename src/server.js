'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth.routes');
const { profileRouter } = require('./routes/profile.routes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.get('/', (req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/profile', profileRouter);

module.exports = { app };
