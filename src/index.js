import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { profileRouter } from './routes/profile.route.js';
import { ApiError } from './exeptions/api.error.js';
import { oauthRouter } from './routes/oauth.route.js';
import passport from './utils/passport.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(passport.initialize());
app.use(oauthRouter);
app.use('/api', authRouter);
app.use('/api/profile', profileRouter);

app.use((req, res, next) => {
  return next(ApiError.notFound());
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line
  console.log(`Server running on localhost:${PORT}`);
});
