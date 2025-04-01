/* eslint-disable no-console */
'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/authRoutes');
const { userRouter } = require('./routes/userRoutes');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

const corsOptions = {
  origin: process.env.CLIENT_HOST,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(errorMiddleware);

app.use(authRouter);
app.use('/users', userRouter);

app.use((req, res) => {
  res.status(404).send('The page is not found');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
