import { json } from 'express';
import Router from '../../core/modules/Router/Router.js';
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
          method: 'post',
          path: AuthRoutes.LOGIN,
          handler: authController.login,
        },
        {
          method: 'get',
          path: AuthRoutes.ACTIVATE,
          handler: authController.activate,
        },
        {
          method: 'get',
          path: AuthRoutes.REFRESH,
          handler: authController.refresh,
        },
        {
          method: 'post',
          path: AuthRoutes.LOGOUT,
          handler: authController.logout,
        },
      ],
    });
  }
}
