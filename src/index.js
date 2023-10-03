
import 'dotenv/config';

import cors from 'cors';
import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { authRouter } from './routes/authRouter.js';
import { userRouter } from './routes/userRouter.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(json());
app.use(authRouter);
app.use('/users', userRouter);
app.use(cookieParser());
app.use(errorMiddleware);

app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_DEV],
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Server started');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on http://localhost:${PORT}`);
});
