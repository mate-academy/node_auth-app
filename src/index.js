'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { authRouter } = require('./routes/auth.route');
const { userRouter } = require('./routes/user.route');

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());

app.use(cors());

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
