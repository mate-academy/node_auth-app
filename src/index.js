'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./routes/authRouter.js');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);

app.listen(PORT);
