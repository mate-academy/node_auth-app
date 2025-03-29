import express from 'express';
import { authRouter, userRouter } from './router/index.js';
import { authMiddleware } from './middleware/index.js';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/user', authMiddleware, userRouter);

app.use('*', (_, res) => {
  res.status(404).send();
});

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`server listen on ${port} port`));
