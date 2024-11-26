'use strict';
/* eslint-disable no-unused-expressions */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { authRoute } = require('./routes/auth.route');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { userRoute } = require('./routes/users.route');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Node auth app!');
});

app.use('/', authRoute);
app.use('/users', userRoute);

app.use((req, res) => {
  res.sendStatus(404);
});

app.use(errorMiddleware);

app.listen(process.env.PORT || 3006, () => {
  /* eslint-disable no-console */
  console.log(`Server is running on ${process.env.BASE}`);
});
