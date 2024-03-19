import express from 'express';
import RootRouter from './core/Root.router.js';
import RootProvider from './core/Root.provider.js';

export function createServer() {
  const app = express();
  const provider = new RootProvider();
  const { router } = new RootRouter(provider);

  app.use(router);

  return app;
}
