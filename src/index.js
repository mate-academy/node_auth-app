/* eslint-disable no-console */
'use strict';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(PORT, () => {
  console.log('Server is running!');
});
