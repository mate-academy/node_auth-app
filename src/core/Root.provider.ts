import AuthProvider from '../modules/Auth/Auth.provider.js';
import EmailProvider from '../modules/Email/Email.provider.js';
import UserProvider from '../modules/User/User.provider.js';

export default class RootProvider {
  public Auth: AuthProvider;
  public User: UserProvider;
  public Email: EmailProvider;

  constructor() {
    this.User = new UserProvider();
    this.Email = new EmailProvider();
    this.Auth = new AuthProvider(this.User.service, this.Email.service);
  }
}
