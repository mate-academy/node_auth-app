import type { Provider } from '../../core/Provider/Provider.js';
import User from './User.model.js';
import UserService from './User.service.js';

export default class UserProvider implements Provider<UserService> {
  public service = new UserService(User);
}
