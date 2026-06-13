'use strict';
require('dotenv').config();

const jwt = require('./utils/jwt.js');

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { authRouter } = require('./routes/authRoute.js');
const { profileRouter } = require('./routes/profileRoute.js');
const { pagesRouter } = require('./routes/pagesRouter.js');

const app = express();

app.use(express.static('src/public'));
app.set('view engine', 'ejs');
app.set('views', './src/views/pages');

app.use(
  express.json(),
  cookieParser(),
  cors({ origin: process.env.CLIENT_HOST, credentials: true }),
);

app.use('/', pagesRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);

app.use('/', (req, res) => {
  const { accessToken } = req.cookies;
  const isAuthorize = Boolean(jwt.verifyAccessToken(accessToken));

  res.render('notFoundPage', { isAuthorize });
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is runnig on: http://localhost:3000');
});
