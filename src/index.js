// 'use strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { userRoute } from './routes/user.route.js';
import { resetRoute } from './routes/reset.route.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_HOST || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(authRouter);
app.use(resetRoute);
app.use('/users', userRoute);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
