'use strict';
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('./utils/jwt.js');
const { isGuest } = require('./middleware/isGuestMiddleware.js');
const { isAuthorize } = require('./middleware/isAuthorizeMiddleware.js');
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
app.use('/auth', isGuest, authRouter);
app.use('/profile', isAuthorize, profileRouter);

app.use('/', (req, res) => {
  const { accessToken } = req.cookies;
  const isAuth = Boolean(jwt.verifyAccessToken(accessToken));

  res.render('notFoundPage', { isAuthorize: isAuth });
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is runnig on: http://localhost:3000');
});
