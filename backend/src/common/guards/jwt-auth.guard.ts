import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUserPayload } from '../types/auth-user-payload';
import type { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthUserPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      if (!payload?.id) {
        throw new UnauthorizedException();
      }

      (request as AuthenticatedRequest).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
