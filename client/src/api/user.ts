import { User } from '../types/User';
import { client } from '../utils/fetchClient';

export const getAllUsers = () => {
  return client.get<User[]>('users');
};

export const addUser = (
  data: Omit<User, 'id' | 'createdAt' | 'verified'>,
) => {
  return client.post<User>('auth/signup', data);
};

export const login = (
  data: Omit<User, 'id' | 'createdAt' | 'verified' | 'name'>,
) => {
  return client.post<User>('auth/login', data);
};

export const resetPasswordRequst = (
  data: Omit<User, 'id' | 'createdAt' | 'verified' | 'name' | 'password'>,
) => {
  return client.post('auth/reset-password', data);
};

export const changeName = (
  data: Omit<User, 'id' | 'createdAt' | 'verified' | 'email' | 'password'>,
) => {
  return client.patch<User>('users/update-name', data);
};

export const updatePassword = (
  data: {
    oldPassword: string,
    newPassword: string,
    newConfirmedPassword: string,
  },
) => {
  return client.patch<User>('users/update-password', data);
};

export const changeEmailRequst = (
  data: Omit<User, 'id' | 'createdAt' | 'verified' | 'name' | 'password'>,
) => {
  return client.patch<User>('users/update-email', data);
};

export const setNewPassword = (
  data: {token: string, newPassword: string},
) => {
  return client.post('auth/set-new-password', data);
};

export const resendEmail = () => {
  return client.get('auth/resend-email');
};

export const getAuthUser = () => {
  return client.get<User>('auth/check-is-auth');
};

export const verifyEmail = (token:string) => {
  return client.get<User>(`auth/verify-email?token=${token}`);
};

export const verifyNewEmail = (
  data: {token:string, email: string}
) => {
  return client.patch<User>('users/set-new-email', data);
};

export const logout = () => {
  return client.get<User>('auth/logout');
};

export const deleteTodo = (id: number) => {
  return client.delete(`/todos/${id}`);
};

export const updateTodo = (
  id: number,
  newFields: Omit<User, 'id' | 'userId' | 'title' | 'createdAt' | 'updatedAt'>
  | Omit<User, 'id' | 'userId' | 'completed' | 'createdAt' | 'updatedAt'>,
) => {
  return client.patch<User>(`/todos/${id}`, newFields);
};
