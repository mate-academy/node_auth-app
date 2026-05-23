import axios from 'axios';
import { api } from './api';
import { accessTokenService } from '../utils/accessTokenService';
import type { ConfirmNewPasswordData } from '../types/ConfirmNewPasswordData';

type CreatePostBody = {
  name: string;
  email: string;
  password: string;
};

type CreatePostResponse = CreatePostBody & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

type LoginPostBody = Omit<CreatePostBody, 'name'>;

type LoginPostResponse = {
  accessToken: string;
  user: {
    email: string;
    id: number;
    name: string;
  };
};



export async function register(data: CreatePostBody) {
  try {
    const response = await api.post<CreatePostResponse>('/registration', data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Registration failed', {
        cause: error,
      });
    }

    throw new Error('Unknown error', {
      cause: error,
    });
  }
}

export async function login(data: LoginPostBody) {
  try {
    const response = await api.post<LoginPostResponse>('/login', data);

    const accessToken = response.data.accessToken || '';

    accessTokenService.save(accessToken);

    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Log in failed', {
        cause: error,
      });
    }
  }
}

export async function logout() {
  try {
    await api.get('/logout');

    accessTokenService.remove();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Logout failed', {
        cause: error,
      });
    }
  }
}

export async function activation(activationToken: string) {
  try {
    const response = await api.post(`/activation/${activationToken}`);

    const accessToken = response.data.accessToken || '';

    accessTokenService.save(accessToken);

    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Wrong activation link', {
        cause: error,
      });
    }
  }
}

export async function checkAuth() {
  try {
    const response = await api.get('/refresh');

    const { accessToken, user } = response.data;

    accessTokenService.save(accessToken);

    return user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return null;
      }
      throw new Error(error.response?.data.message || 'Authorization failed ', {
        cause: error,
      });
    }
  }
}

export async function resetPassword(email: string) {
  try {
    const response = await api.post('/reset-password', { email });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Reset failed', {
        cause: error,
      });
    }
  }
}

export async function confirmNewPassword(data: ConfirmNewPasswordData) {
  try {
    const response = await api.post('/reset-password/confirm', data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.message || 'Reset failed', {
        cause: error,
      });
    }
  }
}

