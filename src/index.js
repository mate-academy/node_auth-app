'use strict';

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import router from './router/index.js';

import sequelize from './config/db.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: true,
  }),
);

app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ message: 'Page Not Found' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    // eslint-disable-next-line no-console
    app.listen(process.env.PORT || 5000, () => console.log('Server started'));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

start();
