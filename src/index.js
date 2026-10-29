import 'dotenv/config';
import express from 'express';
import { sequelize } from './db.js';
import './model/user.model.js';
import authRouter from './routers/auth.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {
  notFoundMiddleware,
  errorMiddleware,
} from './middleware/error.middleware.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({ origin: process.env.FRONT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send(`Welcome to PORT ${PORT}!`);
});

app.use('/auth', authRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to start the server:', error);
    process.exit(1);
  }
};

start();
