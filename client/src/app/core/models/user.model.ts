export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface RegisterResponse extends MessageResponse {
  user: User;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string>;
}
