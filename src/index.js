'use strict';

require('dotenv').config();

const cors = require('cors');
const express = require('express');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');

const { errorMiddleware } = require('./middlewares/error.middleware');
const { authMiddleware } = require('./middlewares/auth.middleware');

const PORT = 4000;

const app = express();

app.use(express.json());
app.use(cors());

app.use(authRouter);
app.use('/user', authMiddleware, userRouter);
app.use('/*', (req, res) => res.sendStatus(404));

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${PORT}`);
});
