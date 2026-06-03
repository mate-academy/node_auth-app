import type { Request } from 'express';
import type { AuthUserPayload } from './auth-user-payload';

export interface AuthenticatedRequest extends Request {
  user: AuthUserPayload;
}
