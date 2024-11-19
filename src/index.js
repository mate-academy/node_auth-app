/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');

require('dotenv').config();

const cookieParser = require('cookie-parser');
const { authRouter } = require('./routes/auth.route.js');
const { userRouter } = require('./routes/user.route.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send(`PORT:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
