/* eslint-disable no-shadow */

// express.d.ts
declare namespace Express {
  export interface Request {
    readonly payload: {
      auth?: { accessToken: string; userId: number };
    };
  }
}
