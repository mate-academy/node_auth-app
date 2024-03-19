import { json } from 'express';
import Router from '../../core/Router/Router.js';
import type AuthController from './Auth.controller.js';

export default class AuthRouter extends Router<AuthController> {
  constructor(authController: AuthController) {
    super({
      controller: authController,
      middlewares: [json()],
      routes: [
        {
          method: 'post',
          path: '/signUp',
          handler: authController.register,
        },
      ],
    });
  }
}
