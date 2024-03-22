import express from 'express';
import RootRouter from './core/root/Root.router.js';
import RootProvider from './core/root/Root.provider.js';
import RootService from './core/root/Root.service.js';

export async function createServer() {
  const app = express();
  const provider = new RootProvider();
  const { router } = new RootRouter(provider);
  const service = new RootService();

  await service.start();
  app.use(router);

  return app;
}
