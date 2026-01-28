import express from 'express';
import cookieParser from 'cookie-parser';

import routes from './routes/index.js';
import { authOpt } from './middlewares/authOpt.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(express.json());
  app.use(cookieParser());

  app.use(authOpt);

  app.use('/', routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
