export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  activationToken: string;
}

export interface ProfileUser {
  id: number;
  name: string;
  email: string;
}
