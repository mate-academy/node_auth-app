import express from 'express';
import type RootProvider from './Root.provider.js';
import AuthRouter from '../modules/Auth/Auth.router.js';

export default class RootRouter {
  public readonly router = express.Router();

  constructor(rootProvider: RootProvider) {
    const authRouter = new AuthRouter(rootProvider.Auth.controller);

    this.router.use('/', authRouter.router);
  }
}
