import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import { profileRouter } from './routes/profile.route.js'
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}))
app.use(authRouter);
app.use('/profile', profileRouter)

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).send({ message: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port:${PORT}`);
});
