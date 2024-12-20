const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routes/auth.route.js');
const { userRouter } = require('./routes/user.route.js');
const errorMiddleware = require('./middlewares/errorMiddleware.js');
const cookieParser = require('cookie-parser');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.json());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);
app.use(cookieParser());

module.exports = app;
