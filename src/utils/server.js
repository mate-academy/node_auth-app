import express from 'express';
import cors from 'cors';
import { routes } from '../api/routes.js';
import { errorMiddleware } from '../middlewares/errorMiddleware.js';

export const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );

  app.use(express.json());

  for (const routeKey in routes) {
    app.use(`/${routeKey}`, routes[routeKey]);
  }

  app.use(errorMiddleware);

  return app;
};
