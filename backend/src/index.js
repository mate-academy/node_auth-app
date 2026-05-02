/* eslint-disable no-console */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import sequelize from './config/db.js';
import { authRouter } from './routes/authRoute.js';
import { userRouter } from './routes/userRoute.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('DB error:', err);
  }
};

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

startServer();
