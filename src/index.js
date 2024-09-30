'use strict';

import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));
app.use(express.json());
app.use(authRouter);

app.get('/', (req, res) => {
  res.send('Home Page');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
