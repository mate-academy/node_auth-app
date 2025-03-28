'use strict';

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const { userRouter } = require('./routes/user.router.js');
const { authRouter } = require('./routes/auth.router.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

require('./config/passport-setup.js');

dotenv.config();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);
app.use((req, res) => res.sendStatus(404));

app.listen(process.env.PORT);
