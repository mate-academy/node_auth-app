/* eslint-disable no-console */
require('dotenv/config');
require('./services/passport.service.js');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth.route.js');
const { userRoute } = require('./routes/user.route.js');
const { defaultRoute } = require('./routes/default.route.js');
const { errorMiddleware } = require('./middlewars/errorMiddleware.js');

const passport = require('passport');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  session({
    secret: 'keyboard cat',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authRouter);
app.use('/user', userRoute);
app.use(defaultRoute);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server run on http://localhost:${PORT}`);
});
