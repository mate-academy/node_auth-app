'use strict';

import 'dotenv/config';

import express from 'express';
import { authRouter } from './src/routes/auth.route.js';

const PORT = process.env.PORT || 3004;

const app = express();

app.use(express.json());
app.use(authRouter);

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log('Server is running');
});
