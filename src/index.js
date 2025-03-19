/* eslint-disable no-console */
'use strict';

const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/authRouter');
const { userRouter } = require('./routes/userRouter');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/update', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => console.log(`Server starting in ${PORT} port`));
