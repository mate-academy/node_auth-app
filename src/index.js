/* eslint-disable no-console */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.router.js';
import { client } from './utils/db.js';
import { userRouter } from './routes/user.router.js';

const PORT = process.env.PORT || 3004;
const app = express();

(async function testConnection() {
  try {
    await client.authenticate();
    console.log('✅ Successfully connected to database!');
  } catch (error) {
    console.error('❌ Error connecting database:', error);
  }
})();

app.use(cookieParser());

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
