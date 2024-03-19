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
    const { name, email, password } = request.body;

    if (!isString(name) || !isString(email) || !isString(password)) {
      throw new Error('Name, email and password are required');
    }

    await this.authService.register({ name, email, password });

    return response.send('OK');
  }
}
