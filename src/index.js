'use strict';

const express = require('express');
const { authRouter } = require('./routes/authRoutes.js');
const { userRouter } = require('./routes/userRoutes.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));
app.use(authRouter);

app.use('/user', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
