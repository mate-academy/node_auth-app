import 'dotenv/config';
import morgan from 'morgan';

import express from 'express';
import { authRouter } from './routers/auth.route.js';
import cors from 'cors';
import { userRouter } from './routers/user.route.js';
import { errorMiddleWare } from './middleWares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const app = express();

const PORT = process.env.PORT || 3006;

// process.env.port
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(errorMiddleWare);

app.listen(PORT, () => {
  // console.log(`Server started on adress http://localhost:${PORT}`);
});
