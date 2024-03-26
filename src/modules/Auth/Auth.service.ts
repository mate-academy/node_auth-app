import 'dotenv/config';
import { v4 as uuid } from 'uuid';
// import bcrypt from 'bcrypt';
import type { UserDTO } from './../User/User.types.js';
import ApiError from '../../core/modules/exceptions/ApiError.js';
import type EmailService from '../Email/Email.service.js';
import type TokenService from '../Token/Token.service.js';
import type UserService from '../User/User.service.js';
import type { AuthConstructorServices, UserTokenPayload } from './Auth.types.js';
import type User from '../User/User.model.js';
import type CacheService from '../Cache/Cache.service.js';
import Validator from '../../core/modules/validation/Validator.js';

class AuthService {
  private readonly userService: UserService;
  private readonly emailService: EmailService;
  private readonly tokenService: TokenService;
  private readonly cacheService: CacheService;
  private readonly resetTokenExpires = +(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN ?? 900);
  private readonly cachePrefix = { RESET_PASSWORD: 'reset-password' };

  constructor({ userService, emailService, tokenService, cacheService }: AuthConstructorServices) {
    this.userService = userService;
    this.emailService = emailService;
    this.tokenService = tokenService;
    this.cacheService = cacheService;
  }

  private isUserTokenPayload(payload: unknown): payload is UserTokenPayload {
    if (typeof payload !== 'object' || payload === null) {
      return false;
    }

    return (
      Validator.isCorrectNumber((payload as UserTokenPayload).id) &&
      Validator.isEmail((payload as UserTokenPayload).email)
    );
  }

  private async generateTokensAndWriteToDB(userPayload: UserTokenPayload) {
    const accessToken = this.tokenService.generateAccessToken(userPayload);
    const refreshToken = this.tokenService.generateRefreshToken(userPayload);

    await this.tokenService.addRefreshToken(userPayload.id, refreshToken);

    return [accessToken, refreshToken];
  }

  verifyAccessToken(token: string) {
    const tokenData = this.tokenService.verifyAccessToken(token);

    if (tokenData !== null && !this.isUserTokenPayload(tokenData)) {
      throw ApiError.ServerError('User access token must to have be a object', {
        payload: { tokenData, token },
      });
    }

    return tokenData;
  }

  accessTokenExpired(token: string) {
    return this.tokenService.isExpired(token);
  }

  async register(userDTO: UserDTO, redirect?: string) {
    const { email, password } = userDTO;
    const user = await this.userService.getByEmail(email);

    if (user !== null) {
      throw ApiError.Conflict('User already exist');
    }

    const newUser = await this.userService.add({
      ...userDTO,
      password,
    });

    const { activationToken } = newUser;

    if (activationToken === null) {
      throw ApiError.ServerError('Activation token is null after creating. Error');
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.emailService.sendActivationEmail(email, activationToken, redirect);

    return newUser;
  }

  async activate(token: string) {
    const [activatedCount] = await this.userService.activate(token);

    if (activatedCount === 0) {
      throw ApiError.BadRequest('Token is not valid');
    }

    if (activatedCount > 1) {
      throw ApiError.ServerError('More than one user with the same uuid token.', {
        payload: { token },
      });
    }
  }

  async login(email: User['email'], password: User['password']) {
    const user = await this.userService.getByEmail(email);

    if (user === null) {
      throw ApiError.NotFound('User not found');
    }

    const { password: userPassword, activationToken } = user;

    if (activationToken !== null) {
      throw ApiError.Forbidden('Email is not activated. Check your email for activation link.');
    }

    const isPasswordCorrect = await this.userService.passwordAreEqual(password, userPassword);

    if (!isPasswordCorrect) {
      throw ApiError.Unauthorized('Password is not correct. Try again.');
    }

    const [accessToken, refreshToken] = await this.generateTokensAndWriteToDB({
      id: user.id,
      email: user.email,
    });

    return {
      accessToken,
      refreshToken,
      user: this.userService.normalize(user),
    };
  }

  async refresh(refreshToken: string) {
    const isExpired = this.tokenService.isExpired(refreshToken);
    const tokenData = this.tokenService.verifyRefreshToken(refreshToken);

    if (isExpired) {
      throw ApiError.Unauthorized('Refresh token expired');
    }

    if (!tokenData) {
      throw ApiError.Unauthorized('Invalid refresh token');
    }

    const userId = await this.tokenService.getUserIdByToken(refreshToken);

    if (userId === null) {
      throw ApiError.Unauthorized('Invalid refresh token');
    }

    const user = await this.userService.getById(userId);

    if (!user) {
      throw ApiError.ServerError('User not found in DB by refresh token', {
        payload: { userId, refreshToken },
      });
    }

    return this.generateTokensAndWriteToDB({ id: user.id, email: user.email });
  }

  async logout(refreshToken: string) {
    const deletedCount = await this.tokenService.removeRefreshToken(refreshToken);

    if (deletedCount === 0) {
      throw ApiError.BadRequest('Refresh token not found');
    }
  }

  async initPasswordReset(email: User['email'], redirectClientUrl: string) {
    const user = await this.userService.getByEmail(email);

    if (!user) {
      throw ApiError.NotFound('User not found. Check your email and try again.');
    }

    const resetPrefix = this.cachePrefix.RESET_PASSWORD;
    const resetToken = uuid();

    await this.cacheService.set(resetPrefix, resetToken, user.id, this.resetTokenExpires);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.emailService.sendResetPasswordEmail(email, resetToken, redirectClientUrl);
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    const resetPrefix = this.cachePrefix.RESET_PASSWORD;
    const userId = await this.cacheService.get<number>(resetPrefix, token);

    if (!userId) {
      throw ApiError.Unauthorized(
        'Reset token is not valid or expired. You need to request a new one.',
      );
    }

    const user = await this.userService.getById(userId);

    if (!user) {
      throw ApiError.NotFound('User not found by reset token. Maybe user was deleted.');
    }

    await this.userService.updateById(user.id, { password: newPassword });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.cacheService.delete(resetPrefix, token);

    return this.userService.normalize(user);
  }
}

export default AuthService;
