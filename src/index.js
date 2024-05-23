/* eslint-disable no-console */
'use strict';
require('dotenv/config');

const express = require('express');
const { authRouter } = require('./routes/auth.route.js');
const { userRouter } = require('./routes/user.route.js');
const cors = require('cors');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const cookieParser = require('cookie-parser');
const { authMiddleware } = require('./middlewares/authMiddleware.js');

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/users', authMiddleware, userRouter);

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
