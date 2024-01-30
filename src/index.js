'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { authRouter } = require('./router/auth.router');
const { userRouter } = require('./router/user.router');
const { authMiddleware } = require('./middlewares/authMiddleware');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(authRouter);
app.use('/users', authMiddleware, userRouter);

app.use(errorMiddleware);


app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${PORT}`);
});

