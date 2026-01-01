import { httpClient } from '../http/httpClient';
import type { User } from '../../types/User';

interface UpdateEmailResponse {
  user: User;
  message: string;
}

function getOne(email: string): Promise<User> {
  return httpClient.get<User>('/users/info', { email });
}

function changeName(newName: string): Promise<User> {
  return httpClient.patch<User>('/users/profile', { newName });
}

function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  return httpClient.patch<void>('/users/update-password', {
    currentPassword,
    newPassword,
  });
}

function changeEmail(
  newEmail: string,
  password: string,
): Promise<UpdateEmailResponse> {
  return httpClient.patch<UpdateEmailResponse>('/users/update-email', {
    newEmail,
    password,
  });
}

export const userService = { getOne, changeName, changePassword, changeEmail };
