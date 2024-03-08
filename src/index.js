'use strict';

require('dotenv/config');

const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const { corsOptions } = require('./utils/cors.js');
const { authRouter } = require('./routers/auth.router.js');
const { userRouter } = require('./routers/user.router.js');
const { errorMW } = require('./middlewares/errorMW.js');
const passport = require('passport');
const session = require('express-session');
const { googleRouter } = require('./routers/google.router.js');

const PORT = process.env.PORT || 3005;
const app = express();

app.use(session({
  secret: process.env.JWT_ACCESS_SECRET,
  resave: true,
  saveUninitialized: true,
}));

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use(authRouter);
app.use('/user', userRouter);
app.use('/auth/google', googleRouter);

app.use(errorMW);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running...');
});
