'use strict';
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { isAuth } from './middlewares/auth.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFound } from './middlewares/not-found.middleware.js';
import passport from './utils/passport.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3005;

const PgStore = pgSession(session);

const sessionStore = new PgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
});

sessionStore.on('error', (err) => {
  logger.error('PgStore error', { message: err.message });
});

app.use(cors({ origin: process.env.CLIENT_HOST, credentials: true }));

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 5,
      sameSite: 'lax',
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/profile', isAuth, userRouter);
app.use(notFound);
app.use(errorMiddleware);

app.listen(PORT);
