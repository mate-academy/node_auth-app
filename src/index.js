'use strict';

import 'dotenv/config';
import morgan from 'morgan';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const PORT = process.env.PORT || 3006;

// process.env.port
app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

// app.use(authRouter);
// app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  // console.log(`Server started on adress http://localhost:${PORT}`);
});
