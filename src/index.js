'use strict';

import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import * as routes from './routes/index.js';
import { errorMiddleware } from './middlewares/index.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(routes.authRouter);

app.use('*', (req, res) => {
  res.sendStatus(404);
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is starting on port ${PORT}`);
});
