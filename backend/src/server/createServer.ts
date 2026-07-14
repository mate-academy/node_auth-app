import express from 'express';
import cors from 'cors';
import { authRoute } from './routers/auth.route.ts';
import { productsRoute } from './routers/products.route.ts';
import { profileRoute } from './routers/profile.router.ts';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: process.env.CLIENT_HOST || 'http://localhost:5173/',
      credentials: true,
    }),
  );

  app.use('/api', express.static('public'));

  app.use('/auth', authRoute);
  app.use('/products', productsRoute);
  app.use('/profile', profileRoute);

  return app;
}
