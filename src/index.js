import express from 'express';
import cookieParser from 'cookie-parser';

import authRouter from './router/auth.router.js';
import userRouter from './router/user.router.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/user', authMiddleware, userRouter);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${port}`);
});
