'use strict';
import express from 'express';
import 'dotenv/config';
import { authRouter } from './controllers/auth.controller.js';
import cors from 'cors';

const PORT = process.env.PORT || 3000;

const app = express(); // create web-server

app.use(express.json());

app.use(cors({
  // use cors to enter from different url
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(authRouter); // connecting routes

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
