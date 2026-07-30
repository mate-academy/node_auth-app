export interface User {
  id?: number;
  name?: string;
  email: string;
  password?: string;
}

export interface FormErros {
  [key: string]: string;
}

export interface Error {
  err: string;
}

export type SubmitCallback = (data: User) => Promise<void>;
