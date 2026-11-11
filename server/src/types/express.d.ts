import type { TokenPayload } from '../services/jwt.service';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
