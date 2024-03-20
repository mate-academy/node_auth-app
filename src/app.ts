import express from 'express';
import RootRouter from './core/Root.router.js';
import RootProvider from './core/Root.provider.js';
import RootService from './core/Root.service.js';

export async function createServer() {
  const app = express();
  const provider = new RootProvider();
  const { router } = new RootRouter(provider);
  const service = new RootService();

  await service.start();
  app.use(router);

  return app;
}
