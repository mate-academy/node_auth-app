'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./routers/auth.router.js');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);

app.get('/', (req, res) => {
  res.send('index!');
});

app.use((req, res) => {
  res.status(404).send('Сторінку не знайдено');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is runn');
});
