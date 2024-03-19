import type { Provider } from '../../core/Provider/Provider.js';
import type EmailService from '../Email/Email.service.js';
import type UserService from '../User/User.service.js';
import AuthController from './Auth.controller.js';
import AuthService from './Auth.service.js';

export default class AuthProvider implements Provider<AuthService, AuthController> {
  public service;
  public controller;

  constructor(userService: UserService, emailService: EmailService) {
    this.service = new AuthService({ userService, emailService });
    this.controller = new AuthController(this.service);
  }
}
