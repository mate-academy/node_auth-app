'use strict';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { authRouter } from './routers/auth.router.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { profileRouter } from './routers/profile.router.js';

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.use(cors());

app.use('/auth', authRouter);
app.use('/profile', profileRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Server running on port ${PORT}\nYou can access the server at http://localhost:${PORT}`,
  );
});
