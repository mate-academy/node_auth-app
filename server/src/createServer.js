'use strict';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
import cors from 'cors';

import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';

export const createServer = () => {
  const app = express();

  const corsOptions = {
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }

  app.enable('trust proxy');

  app.use(cors(corsOptions));


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(cookieParser());

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 60*60*24*1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/auth', authRouter);
  app.use('/users', userRouter);

  return app;
}
