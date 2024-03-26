import ApiError from '../../core/modules/exceptions/ApiError.js';
import type User from '../User/User.model.js';
import type { TokenModelType } from './Token.model.js';
import jwt from 'jsonwebtoken';

type TokenPayload = string | object | Buffer;

export default class TokenService {
  constructor(private readonly TokenModel: TokenModelType) {}

  private verify(token: string, secret: string) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      return null;
    }
  }

  private generate(payload: TokenPayload, secretName: string, expiresInName: string) {
    const secret = process.env[secretName];
    const expiresIn = process.env[expiresInName];

    if (!secret) {
      throw ApiError.ServerError(`TOKEN_SECRET is not defined in env`, {
        payload: { secretName },
      });
    }

    if (!expiresIn) {
      throw ApiError.ServerError(`TOKEN_EXPIRES_IN is not defined in env`, {
        payload: { expiresInName },
      });
    }

    return jwt.sign(payload, secret, { expiresIn });
  }

  isExpired(token: string) {
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ?? '');
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return true;
      }
    }

    return false;
  }

  generateAccessToken(payload: TokenPayload) {
    return this.generate(payload, 'ACCESS_TOKEN_SECRET', 'ACCESS_TOKEN_EXPIRES_IN');
  }

  generateRefreshToken(payload: TokenPayload) {
    return this.generate(payload, 'REFRESH_TOKEN_SECRET', 'REFRESH_TOKEN_EXPIRES_IN');
  }

  verifyAccessToken(token: string) {
    return this.verify(token, process.env.ACCESS_TOKEN_SECRET ?? '');
  }

  verifyRefreshToken(token: string) {
    return this.verify(token, process.env.REFRESH_TOKEN_SECRET ?? '');
  }

  async getUserIdByToken(token: string) {
    const tokenItem = await this.TokenModel.findOne({ where: { token } });

    if (!tokenItem) {
      return null;
    }

    return tokenItem.userId;
  }

  removeRefreshToken(token: string) {
    return this.TokenModel.destroy({ where: { token } });
  }

  addRefreshToken(userId: User['id'], refreshToken: string) {
    return this.TokenModel.create({ userId, token: refreshToken });
  }
}
