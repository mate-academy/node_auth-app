import type { NormalizedUser } from '../modules/users/users.service.ts';

declare global {
  namespace Express {
    interface Request {
      user?: NormalizedUser;
    }
  }
}

export {};
