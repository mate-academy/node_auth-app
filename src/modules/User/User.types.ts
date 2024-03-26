import type CacheService from '../Cache/Cache.service.js';
import type EmailService from '../Email/Email.service.js';
import type { UserModelType } from './User.model.js';
import type User from './User.model.js';

export interface UserServiceConstructor {
  UserModel: UserModelType;
  emailService: EmailService;
  cacheService: CacheService;
}

export interface UserDTO {
  email: User['email'];
  password: User['password'];
  name: User['name'];
}

export interface UserUpdateEmailCacheDTO {
  newEmail: User['email'];
  userId: User['id'];
}
