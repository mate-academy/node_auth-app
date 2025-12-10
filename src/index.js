/* eslint-disable no-console */

import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { google } from 'googleapis';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3005;

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);

const SCOPES = ['https://mail.google.com/'];

app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);

  console.log('✅ ACCESS TOKEN:', tokens.access_token);
  console.log('✅ REFRESH TOKEN:', tokens.refresh_token);
  res.send('Authorization successful! Check your console for tokens.');
});

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/', userRouter);

app.get('/', (req, res) => {
  res.end('hello');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
