'use strict';

import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import cors from 'cors';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3005;

const corsOptions = {
  origin: process.env.CLIENT_HOST,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
