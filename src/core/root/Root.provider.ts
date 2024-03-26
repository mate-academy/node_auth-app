import AuthProvider from '../../modules/Auth/Auth.provider.js';
import CacheProvider from '../../modules/Cache/Cache.provider.js';
import EmailProvider from '../../modules/Email/Email.provider.js';
import TokenProvider from '../../modules/Token/Token.provider.js';
import UserProvider from '../../modules/User/User.provider.js';

export default class RootProvider {
  public Cache: CacheProvider;
  public Token: TokenProvider;
  public Auth: AuthProvider;
  public User: UserProvider;
  public Email: EmailProvider;

  constructor() {
    this.Cache = new CacheProvider();
    this.Token = new TokenProvider();
    this.Email = new EmailProvider();

    this.User = new UserProvider({
      cacheService: this.Cache.service,
      emailService: this.Email.service,
    });

    this.Auth = new AuthProvider({
      cacheService: this.Cache.service,
      userService: this.User.service,
      emailService: this.Email.service,
      tokenService: this.Token.service,
    });
  }
}
