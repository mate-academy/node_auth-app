/* eslint-disable no-console */
'use strict';
require('dotenv').config();

const cors = require('cors');
const authRouter = require('./routes/authRouter');
const express = require('express');
const { userRouter } = require('./routes/userRouter');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Server is working on http://localhost:${PORT}`);
});
