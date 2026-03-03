import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import './models/user.js';
import './models/token.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(authRouter);

app.use((req, res) => {
  res.status(404).send({
    message: 'Resource not found',
    error: 404,
  });
});

app.listen(3005);
