import 'dotenv/config';
import bcrypt from 'bcrypt';
import type { UserDTO } from './../User/User.types.js';
import ApiError from '../../core/modules/exceptions/ApiError.js';
import type EmailService from '../Email/Email.service.js';
import type TokenService from '../Token/Token.service.js';
import type UserService from '../User/User.service.js';
import type { AuthConstructorServices, UserTokenPayload } from './Auth.types.js';
import type User from '../User/User.model.js';

const { BCRYPT_SALT_ROUNDS } = process.env;

class AuthService {
  private readonly userService: UserService;
  private readonly emailService: EmailService;
  private readonly tokenService: TokenService;

  constructor({ userService, emailService, tokenService }: AuthConstructorServices) {
    this.userService = userService;
    this.emailService = emailService;
    this.tokenService = tokenService;
  }

  private async generateTokensAndWriteToDB(userPayload: UserTokenPayload) {
    const accessToken = this.tokenService.generateAccessToken(userPayload);
    const refreshToken = this.tokenService.generateRefreshToken(userPayload);

    await this.tokenService.addRefreshToken(userPayload.id, refreshToken);

    return [accessToken, refreshToken];
  }

  accessTokenIsValid(token: string) {
    const tokenData = this.tokenService.verifyAccessToken(token);

    return !!tokenData;
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

    const saltRounds = +(BCRYPT_SALT_ROUNDS ?? 10);
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await this.userService.add({
      ...userDTO,
      password: encryptedPassword,
    });

    const { activationToken } = newUser;

    if (activationToken === null) {
      throw ApiError.ServerError('Activation token is null after creating. Error');
    }

    this.emailService.sendActivationEmail(email, activationToken, redirect).catch((err) => {
      throw ApiError.ServerError("Activation email wasn't send", { cause: err });
    });

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

    const isPasswordCorrect = await bcrypt.compare(password, userPassword);

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
}

export default AuthService;
