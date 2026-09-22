import type { User } from "./user";

export interface AuthData {
  accessToken: string;
  user: User;
}
