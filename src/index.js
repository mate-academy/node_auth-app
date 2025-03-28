'use strict';
/* eslint-disable no-console */

const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routes/authRoute.js');
const { userRouter } = require('./routes/userRoute.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
const cookieParser = require('cookie-parser');

dotenv.config();

const PORT = process.env.PORT || 3005;
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/users', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Server is running');
});
