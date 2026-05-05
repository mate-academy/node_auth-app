'use strict';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { sequelize } from './config/db';
import { authRouter } from './routes/authRouter';
import { userRouter } from './routes/userRouter';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use('/auth', authRouter);
app.use('/profile', userRouter);

async function start() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log("Виконано з'єднання з бд");

    await sequelize.sync();
    // eslint-disable-next-line no-console
    console.log('Створено моделі в бд');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Помилка запуску сервера', error);
  }
}

app.use((req, res) => {
  res.status(404).send({ error: 'Page is not found' });
});

start();
