'use strict';

import express from 'express';
import session from 'express-session';
import { authRouter } from './routes/authRoutes';
import { sequelize } from './config/database';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(
  session({
    secret: process.env.KEY || 'test',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);
app.use('/auth', authRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Сторінку не знайдено' });
});

const start = async () => {
  try {
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {});
  } catch (error) {}
};

start();
