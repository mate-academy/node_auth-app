/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import type EmailService from '../Email/Email.service.js';
import type TokenService from '../Token/Token.service.js';
import type User from '../User/User.model.js';
import type UserService from '../User/User.service.js';

export interface AuthConstructorServices {
  userService: UserService;
  emailService: EmailService;
  tokenService: TokenService;
}

export type UserValidateDTO = Record<keyof Pick<User, 'email' | 'password'>, unknown>;

export interface UserTokenPayload {
  id: User['id'];
  email: string;
}
