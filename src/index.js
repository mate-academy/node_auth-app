import express from 'express';
import authRouter from './router/auth.router.js';
import userRouter from './router/user.router.js';
import cookieParser from 'cookieParser';
import { authMiddleware } from './middlewares/auth.mildware.js';

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
