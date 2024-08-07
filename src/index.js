'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { userRouter } = require('./routes/user.route');
const { unknownEndpoint } = require('./middlewares/helper.middleware');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/users', userRouter);
app.use(unknownEndpoint);
app.use(errorMiddleware);

/* eslint-disable no-console */
app.listen(process.env.PORT, () => {
  console.log(`Server has started on port:${process.env.PORT || 5000}`);
});
