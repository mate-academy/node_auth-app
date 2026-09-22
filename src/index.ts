'use strict';

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.router.js';
import { sequelize } from './config/db.js';
import { usersRouter } from './routes/user.router.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

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

start();
