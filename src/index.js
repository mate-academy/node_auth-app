'use strict';

import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(authRouter);

app.get('/', (req, res) => {
  res.send('Test..');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
