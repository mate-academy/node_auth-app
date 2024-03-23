import type CacheService from '../Cache/Cache.service.js';
import type EmailService from '../Email/Email.service.js';
import type TokenService from '../Token/Token.service.js';
import type User from '../User/User.model.js';
import type UserService from '../User/User.service.js';

export interface AuthConstructorServices {
  userService: UserService;
  emailService: EmailService;
  tokenService: TokenService;
  cacheService: CacheService;
}

export type UserValidateDTO = Record<keyof Pick<User, 'email' | 'password'>, unknown>;

export interface UserTokenPayload {
  id: User['id'];
  email: string;
}
