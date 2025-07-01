import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './api/auth.router.js';
import { profileRouter } from './api/profile.router.js';
import { usersRouter } from './api/users.router.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Routes
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
  },
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
