const API_URL = 'http://localhost:3008/api/auth';

const request = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Unable to connect to the server. Please try again later.',
      );
    }

    throw error;
  }
};

export const register = (userData) =>
  request(`${API_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const login = (credentials) =>
  request(`${API_URL}/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const activate = (token) => request(`${API_URL}/activate/${token}`);

export const forgotPassword = (email) =>
  request(`${API_URL}/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token, data) =>
  request(`${API_URL}/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getMe = (accessToken) => {
  const headers = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return request(`${API_URL}/me`, {
    headers,
  });
};

export const changeName = (accessToken, name) =>
  request(`${API_URL}/me/name`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name }),
  });

export const changePassword = (accessToken, data) =>
  request(`${API_URL}/me/password`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

export const changeEmail = (accessToken, data) =>
  request(`${API_URL}/me/email`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

export const confirmEmailChange = (token) =>
  request(`${API_URL}/change-email/${token}`);

export const logout = (refreshToken) =>
  request(`${API_URL}/logout`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

export const refreshAccessToken = (refreshToken) =>
  request(`${API_URL}/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
