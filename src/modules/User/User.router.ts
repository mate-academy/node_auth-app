import Router from '../../core/modules/Router/Router.js';
import type UserController from './User.controller.js';
import type AuthController from '../Auth/Auth.controller.js';
import { json } from 'express';

interface Controllers {
  userController: UserController;
  authController: AuthController;
}

export default class UserRouter extends Router<UserController> {
  constructor({ userController, authController }: Controllers) {
    super({
      controller: userController,
      middlewares: [authController.withAuth(), json()],
      routes: [
        {
          method: 'patch',
          path: '/',
          handler: userController.update,
        },
      ],
    });
  }
}
