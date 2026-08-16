import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middlewares/auth.middleware.js';
import authRouter from './routes/auth.router.js';
import userRouter from './routes/user.router.js';
import { db } from './utils/db.js';
import errorMiddleware from './middlewares/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use('/auth', authRouter);
app.use('/users', authMiddleware, userRouter);

app.get('/', (req, res) => {
  res.send({ message: 'This is the User registration app.' });
});

app.use('{*path}', (req, res, next) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Server is running on port ${PORT}`);
});

function cleanUp() {
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', cleanUp);
process.on('SIGINT', cleanUp);
