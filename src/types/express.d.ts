import { NormalizedUser } from '../services/user.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: NormalizedUser;
    }
  }
}
