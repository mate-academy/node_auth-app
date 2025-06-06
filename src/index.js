import express from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import { profileRouter } from './routes/profile.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use(profileRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running...');
});
