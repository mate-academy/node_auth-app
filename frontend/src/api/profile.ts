import { httpClient } from '@/http/httpClient';

function changeName({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}): Promise<{ message: string }>{
  return httpClient.post('/profile/change-name', { firstName, lastName });
}

function changeEmail({
  password,
  newEmail,
}: {
  password: string;
  newEmail: string;
}): Promise<{ message: string }> {
  return httpClient.post('/profile/change-email', { password, newEmail });
}

function changeEmailConfirm(resetToken: string): Promise<{ message: string }> {
  return httpClient.get(`/profile/change-email/confirm/${resetToken}`);
}

function changePassword({
  currentPassword,
  newPassword,
  confirmNewPassword,
}: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<{ message: string }> {
  return httpClient.post('/profile/change-password', { currentPassword, newPassword, confirmNewPassword });
}

export const apiProfile = {
  changeEmail,
  changeName,
  changePassword,
  changeEmailConfirm,
};
