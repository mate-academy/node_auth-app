import type { Provider } from '../../core/modules/Provider/Provider.js';
import UserController from './User.controller.js';
import User from './User.model.js';
import UserService from './User.service.js';

export default class UserProvider implements Provider<UserService, UserController> {
  public service;
  public controller;

  constructor() {
    this.service = new UserService(User);
    this.controller = new UserController(this.service);
  }
}
