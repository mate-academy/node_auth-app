export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isActivated: boolean;
};

export type AuthResponse = {
  message: string;
  data: AuthUser;
};

export type RegistrationResponse = {
  message: string;
  data: AuthUser & {
    activationToken: string;
  };
};

export type MessageResponse = {
  message: string;
};
