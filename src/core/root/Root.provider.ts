import AuthProvider from '../../modules/Auth/Auth.provider.js';
import EmailProvider from '../../modules/Email/Email.provider.js';
import TokenProvider from '../../modules/Token/Token.provider.js';
import UserProvider from '../../modules/User/User.provider.js';

export default class RootProvider {
  public Token: TokenProvider;
  public Auth: AuthProvider;
  public User: UserProvider;
  public Email: EmailProvider;

  constructor() {
    this.Token = new TokenProvider();
    this.User = new UserProvider();
    this.Email = new EmailProvider();

    this.Auth = new AuthProvider({
      userService: this.User.service,
      emailService: this.Email.service,
      tokenService: this.Token.service,
    });
  }
}
