import express from 'express';
import 'dotenv/config';
import { db } from './utils/db.js';
import { authRouter } from './routes/auth.router.js';
import cors from 'cors';
import { userRouter } from './routes/user.router.js';
import { resetRouter } from './routes/reset.router.js';

const PORT = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(authRouter);

app.use('/users', userRouter);

app.use('/reset', resetRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server start at http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  // eslint-disable-next-line no-console
  console.log('Stopping server...');
  await db.$disconnect();

  server.close(async () => {
    // eslint-disable-next-line no-console
    console.log('Server stopped gracefully');
    process.exit(0);
  });
});
