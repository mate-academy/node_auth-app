// eslint-disable-next-line no-shadow
import type { Request, Response } from 'express';
import type AuthService from './Auth.service.ts';

export default class AuthController {
  constructor(protected authService: AuthService) {}

  protected isString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
  };

  async register(request: Request, response: Response) {
    const { isString } = this;
    const { name, email, password, redirect } = request.body;

    if (!isString(name) || !isString(email) || !isString(password)) {
      throw new Error('Name, email and password are required');
    }

    if (!isString(redirect)) {
      throw new Error('Redirect must be a string');
    }

    await this.authService.register({ name, email, password }, redirect);

    return response.send('OK');
  }

  async activate(request: Request, response: Response) {
    const { token, redirect } = request.query;

    if (!this.isString(token)) {
      throw new Error('Token is required');
    }

    await this.authService.activate(token);

    if (!this.isString(redirect)) {
      response.send('OK');

      return;
    }

    response.redirect(redirect);
  }
}
