import express from 'express';
import cors from 'cors';
import { routes } from '../api/routes.js';
import { errorMiddleware } from '../middlewares/errorMiddleware.js';
import { ApiError } from '../exceptions/api.error.js';
import cookieParser from 'cookie-parser';

export const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );

  app.use(cookieParser());

  for (const routeKey in routes) {
    app.use(`/${routeKey}`, routes[routeKey]);
  }

  app.use('{*path}', (req, res, next) => {
    next(ApiError.notFound());
  });

  app.use(errorMiddleware);

  return app;
};
