'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRouter = require('./routes/auth');
const passwordRouter = require('./routes/password');
const profileRouter = require('./routes/profile');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/password', passwordRouter);
app.use('/api/profile', profileRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
