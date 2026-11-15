import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoute } from './routes/auth.route.js';
import { profileRouter } from './routes/profile.route.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { ApiError } from './exceptions/api.error.js';

export function createServer() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use(authRoute);
  app.use(profileRouter);

  // Any request that did not match a route above
  app.use(() => {
    throw ApiError.notFound('Route not found');
  });

  app.use(errorMiddleware);

  return app;
}
