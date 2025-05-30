export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  activationToken: string;
}
