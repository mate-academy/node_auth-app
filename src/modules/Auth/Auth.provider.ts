import type { Provider } from '../../core/modules/Provider/Provider.js';
import AuthController from './Auth.controller.js';
import AuthService from './Auth.service.js';
import type { AuthConstructorServices } from './Auth.types.js';

export default class AuthProvider implements Provider<AuthService, AuthController> {
  public service;
  public controller;

  constructor(authServices: AuthConstructorServices) {
    this.service = new AuthService(authServices);
    this.controller = new AuthController(this.service);
  }
}
