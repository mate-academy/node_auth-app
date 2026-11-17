import type { NormalizedAuthUser } from '../User/utils.js';

export type AuthenticationData = {
  user: NormalizedAuthUser;
  accessToken: string;
  refreshToken: string;
};
