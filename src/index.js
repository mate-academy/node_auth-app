/* eslint-disable no-console */
'use strict';
require('dotenv').config();

const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRouter');
const expensesRouter = require('./routes/expensesRouter');
const { userRouter } = require('./routes/userRouter');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_DEV],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use(authRouter);
app.use('/users', userRouter);
app.use('/expenses', expensesRouter);

app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Server is working on http://localhost:${PORT}`);
});
