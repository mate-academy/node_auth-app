import { json } from 'express';
import Router from '../../core/Router/Router.js';
import type AuthController from './Auth.controller.js';
import { AuthRoutes } from './Auth.routes.js';

export default class AuthRouter extends Router<AuthController> {
  constructor(authController: AuthController) {
    super({
      controller: authController,
      middlewares: [json()],
      routes: [
        {
          method: 'post',
          path: AuthRoutes.REGISTER,
          handler: authController.register,
        },
        {
          method: 'get',
          path: AuthRoutes.ACTIVATE,
          handler: authController.activate,
        },
      ],
    });
  }
}
