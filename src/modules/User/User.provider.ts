import type { Provider } from '../../core/modules/Provider/Provider.js';
import UserController from './User.controller.js';
import User from './User.model.js';
import UserService from './User.service.js';
import type { UserServiceConstructor } from './User.types.js';

type UserProviderConstructor = Omit<UserServiceConstructor, 'UserModel'>;

export default class UserProvider implements Provider<UserService, UserController> {
  public service;
  public controller;

  constructor(services: UserProviderConstructor) {
    this.service = new UserService({ ...services, UserModel: User });
    this.controller = new UserController(this.service);
  }
}
