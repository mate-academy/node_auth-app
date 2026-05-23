import axios from 'axios';
import { api } from './api';

export async function changeName(newName: string) {
  try {
    const response = await api.patch('/profile/name', { newName });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Change failed', {
        cause: error,
      });
    }

    throw new Error('Unknown error', {
      cause: error,
    });
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  try {
    const response = await api.patch('/profile/password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Change failed', {
        cause: error,
      });
    }

    throw new Error('Unknown error', {
      cause: error,
    });
  }
}

export async function changeEmail(newEmail: string, password: string) {
  try {
    const response = await api.patch('/profile/email', {
      newEmail,
      password,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Change failed', {
        cause: error,
      });
    }

    throw new Error('Unknown error', {
      cause: error,
    });
  }
}

export async function confirmEmailToken(emailChangeToken: string) {
  try {
    const response = await api.get(`profile/confirm-email-change/${emailChangeToken}`);

    return response.data.message;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Change failed', {
        cause: error,
      });
    }

    throw new Error('Unknown error', {
      cause: error,
    });
  }
}
