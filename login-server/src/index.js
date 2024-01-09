'use strict';

const express = require('express');

require('dotenv').config();

const cors = require('cors');

const PORT = process.env.PORT || 3004;
const app = express();
const { authRouter } = require('./routes/auth.route.js');
const { userRouter } = require('./routes/user.route.js');
const { errorMiddleware } = require('./middlewars/errorMiddleware');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('server is running');
});
