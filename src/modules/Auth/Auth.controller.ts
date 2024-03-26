// eslint-disable-next-line no-shadow
import type { Request, Response } from 'express';
import type { Middleware } from '../../core/modules/Router/Router.types.js';
import type { UserValidateDTO } from './Auth.types.js';
import type AuthService from './Auth.service.ts';
import ApiError from '../../core/modules/exceptions/ApiError.js';
import Validator from '../../core/modules/validation/Validator.js';
import { AuthRoutes } from './Auth.routes.js';

export default class AuthController {
  constructor(protected authService: AuthService) {}

  private emailAndPasswordAreValid({ email, password }: UserValidateDTO) {
    if (!Validator.isEmail(email)) {
      throw ApiError.BadRequest('Email is not valid');
    }

    if (!Validator.isStrongPassword(password)) {
      throw ApiError.BadRequest('Password must be at least 8 characters long');
    }
  }

  private setRefreshTokenInCookie(response: Response, token: string) {
    response.cookie('refreshToken', token, {
      httpOnly: true,
      maxAge: +(process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN ?? -1) * 1000 * 60 * 60,
    });
  }

  private setAccessTokenInCookie(response: Response, token: string) {
    response.cookie('accessToken', token, {
      httpOnly: true,
      maxAge: +(process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN ?? -1) * 1000,
    });
  }

  async register(request: Request, response: Response) {
    const { name, email, password, redirect } = request.body;

    this.emailAndPasswordAreValid({ email, password });

    if (!Validator.isNotEmptyString(name)) {
      throw ApiError.BadRequest('Name must be a string');
    }

    if (redirect !== undefined && !Validator.isURL(redirect)) {
      throw ApiError.BadRequest('Redirect is must be a valid URL');
    }

    await this.authService.register({ name, email, password }, redirect as string);

    return response.send({
      message: 'Registration successful. A confirmation email has been sent to your address.',
    });
  }

  async activate(request: Request, response: Response) {
    const { token, redirect } = request.query;

    if (!Validator.isUUID(token)) {
      throw ApiError.BadRequest('Token is missing or invalid');
    }

    await this.authService.activate(token);

    if (!Validator.isURL(redirect)) {
      response.send({ message: 'Your account has been activated.' });

      return;
    }

    response.redirect(redirect);
  }

  async login(request: Request, response: Response) {
    const { email, password } = request.body;

    this.emailAndPasswordAreValid({ email, password });

    const { refreshToken, accessToken, user } = await this.authService.login(
      email as string,
      password as string,
    );

    this.setRefreshTokenInCookie(response, refreshToken);
    this.setAccessTokenInCookie(response, accessToken);

    response.send({ message: "You've logged in successfully", user });
  }

  async refresh(request: Request, response: Response) {
    const port = process.env.PORT ?? '3005';
    const { protocol, hostname } = request;
    const { redirect } = request.query;
    const { refreshToken } = request.cookies;

    if (!Validator.isNotEmptyString(refreshToken)) {
      throw ApiError.Unauthorized('Refresh token is invalid');
    }

    const [newAccessToken, newRefreshToken] = await this.authService.refresh(refreshToken);

    this.setRefreshTokenInCookie(response, newRefreshToken);
    this.setAccessTokenInCookie(response, newAccessToken);

    if (Validator.isNotEmptyString(redirect)) {
      response.redirect(`${protocol}://${hostname}:${port}${redirect}`);

      return;
    }

    response.send({ message: 'AccessToken updated successfully' });
  }

  async logout(request: Request, response: Response) {
    const { refreshToken, accessToken } = request.cookies;

    if (!Validator.isNotEmptyString(refreshToken)) {
      throw ApiError.Unauthorized('Refresh token is invalid');
    }

    if (!Validator.isNotEmptyString(accessToken)) {
      throw ApiError.Unauthorized('Access token is invalid');
    }

    await this.authService.logout(refreshToken);

    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');

    response.send({ message: 'You have been logged out successfully' });
  }

  async requestPasswordReset(request: Request, response: Response) {
    const { email, redirect } = request.body;

    if (!Validator.isEmail(email)) {
      throw ApiError.BadRequest('Email is not valid');
    }

    if (!Validator.isURL(redirect)) {
      throw ApiError.BadRequest('Redirect is must be a valid URL');
    }

    await this.authService.initPasswordReset(email, redirect);

    response.send({
      message: 'A password reset link has been sent to your email address',
    });
  }

  async confirmPasswordReset(request: Request, response: Response) {
    const { token, password } = request.body;

    if (!Validator.isUUID(token)) {
      throw ApiError.BadRequest('Token is not valid');
    }

    if (!Validator.isStrongPassword(password)) {
      throw ApiError.BadRequest('Password must be at least 8 characters long');
    }

    const user = await this.authService.confirmPasswordReset(token, password);

    return response.send({ message: 'Password reset successful', user });
  }

  withAuth(): Middleware {
    return (request, response, next) => {
      const { accessToken } = request.cookies;

      if (!Validator.isNotEmptyString(accessToken)) {
        throw ApiError.Unauthorized(
          'Access token is invalid. It must be provided in the accessToken cookie',
        );
      }

      const tokenExpired = this.authService.accessTokenExpired(accessToken);
      const port = process.env.PORT ?? '3005';
      const host = process.env.HOST ?? 'localhost';

      if (tokenExpired) {
        return response.redirect(
          `http://${host}:${port}${AuthRoutes.REFRESH}?redirect=${request.url}`,
        );
      }

      const userTokenData = this.authService.verifyAccessToken(accessToken);

      if (!userTokenData) {
        throw ApiError.Unauthorized('Access token is invalid');
      }

      request.payload.auth = {
        accessToken,
        userId: userTokenData.id,
      };

      next();
    };
  }
}
