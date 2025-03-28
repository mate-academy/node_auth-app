/* eslint-disable no-console */
'use strict';
import express from 'express';
import cors from 'cors';
import authRouter from './router';

const PORT = process.env.PORT || 5050;

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', authRouter);

app.listen(PORT, () => {
  console.log(`server is running on PORT: ${PORT}`);
});