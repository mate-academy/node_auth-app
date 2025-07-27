/* eslint-disable no-console */
'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth.routes.js');
const { userRouter } = require('./routes/user.routes.js');
const { errorMiddleware } = require('./middlewares/error.middleware.js');

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello auth!');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
