'use strict';

import 'dotenv/config'
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMidleware } from './middlewares/errorMidleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3004;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use("/user", userRouter);

app.get('/', (req, res) => {
  res.send('hello');
});

app.use(errorMidleware)

app.listen(PORT, () => {
  console.log(`Server is raning: http://localhost:${PORT}`);
})
