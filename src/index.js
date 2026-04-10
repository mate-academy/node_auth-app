import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { errorMiddleweare } from './middlewares/errorMiddleware.js';
import { client } from './utils/db.js';
import './models/user.js';
import './models/token.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);

app.use((req, res) => {
  res.status(404).send({
    message: 'Route not found',
  });
});

app.use(errorMiddleweare);

async function start() {
  try {
    await client.authenticate();
    await client.sync({ alter: true });

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
  }
}

start();
