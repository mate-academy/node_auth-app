'use strict';

require('dotenv/config');

const express = require('express');
const { authRouter } = require('./routes/auth.route.js');
const cors = require('cors');
const { userRouter } = require('./routes/user.route.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  // console.log('Server is running');
});
