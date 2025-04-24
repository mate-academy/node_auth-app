'use strict';
require('dotenv/config');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authRoute } = require('./routes/auth.route.js');
const { resetPassRoute } = require('./routes/resetPass.route.js');
const { profileRoute } = require('./routes/profile.route.js');
const { pageNotFound } = require('./error/pageNotFound.js');

const app = express();

const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_SERVER,
    credentials: true,
  }),
);
app.use(authRoute);
app.use('/password', resetPassRoute);
app.use('/profile', profileRoute);
app.use(pageNotFound);

app.listen(PORT);
