import express from 'express';
import cookieParser from 'cookie-parser';
import type RootProvider from './Root.provider.js';
import AuthRouter from '../../modules/Auth/Auth.router.js';
import ApiError from '../modules/exceptions/ApiError.js';
import UserRouter from '../../modules/User/User.router.js';
import { requestPayload } from '../middlewares/requestPayload.js';

export default class RootRouter {
  public readonly router = express.Router();

  constructor(rootProvider: RootProvider) {
    const authRouter = new AuthRouter(rootProvider.Auth.controller);
    const userRouter = new UserRouter({
      userController: rootProvider.User.controller,
      authController: rootProvider.Auth.controller,
    });

    this.router.use(requestPayload());
    this.router.use(cookieParser());
    this.router.use('/', authRouter.router);
    this.router.use('/user', userRouter.router);
    this.router.use(ApiError.handleRouteNotFoundError);
    this.router.use(ApiError.handle);
  }
}
