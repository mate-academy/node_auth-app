'use strict';

const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routers/auth-router.js');
const { usersRouter } = require('./routers/users-router.js');
const { errorMiddleware } = require('./middlewares/error-middleware.js');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 5500;

const app = express();

app.use(
  cors({
    origin: process.env.REACT_APP_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use(usersRouter);

app.use((req, res) => {
  res.sendStatus(404);
});

app.use(errorMiddleware);

app.listen(PORT, () => {});
