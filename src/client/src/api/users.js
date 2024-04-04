import { createClient } from './index.js';

export const client = createClient();

client.interceptors.request.use(onRequest);
client.interceptors.response.use(onResponseSuccess, onResponseError);

function wait(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
};

function onRequest(request) {
  
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    request.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return request;
};

function onResponseSuccess(response) {
  return response;
};

async function onResponseError(error) {
  const originalRequest = error.config;

  if (!error.response
    || error.response.status !== 401
    || error.response.data.message === 'Failed to refresh'){
    throw error;
  }
  
  try {
    const { accessToken } = await refresh();

    localStorage.setItem('accessToken', accessToken);

    return client.request(originalRequest);
  } catch (error) {
    throw error;
  }
};

export const getUsers = async () => {
  await wait(1000);

  const response = await client.get('/users');

  return response.data;
}

export const registerUser = async (name, email, password) => {
  const response = await client.post('/registration', { name, email, password });

  return response.data;
}

export const activate = async (token) => {
  await wait(2000);

  const response = await client.get(`/activate/${token}`);

  return response.data;    
}

export const loginUser = async (email, password) => {
  const response = await client.post('/login', { email, password });

  return response.data;
}

export const logoutUser = async () => {
  return await client.get('/logout');
};

export const verifyUser = async (email) => {
  await wait(1000);

  const response = await client.post('/verify', { email })

  return response.data;
};

export const compareTokens = async (email, token) => {
  await wait(1000);

  const response = await client.post('/compare-tokens', { email, token });

  return response.data;
};

export const getCredentials = async () => {
  await wait(1000);

  const response = await client.get('/get-credentials');

  return response.data;
};

export const rememberCredentials = async (email, password) => {
  await client.post('/remember-credentials', { email, password });
};

export const clearCredentials = async () => {
  await client.get('/clear-credentials');
};

export const reset = async (email, newPassword) => {
  await wait(1000);

  await client.post('/reset', { email, newPassword });
};

export const verifyPassword = async (email, password) => {
  await wait(1000);

  const response = await client.post('/verify-password', { email, password });

  return response.data;
};

export const rename = async (email, name) => {
  await wait(1000);

  const response = await client.post('/rename', { email, name });

  return response.data;
};

export const verifyEmail = async (newEmail) => {
  await wait(1000);

  const response = await client.post('/verify-email', { newEmail });

  return response.data;
};

export const resetEmail = async (oldEmail, newEmail, token) => {
  await wait(1000);

  const response = await client.post('/reset-email', { oldEmail, newEmail, token });

  return response.data;
};

export const resetPassword = async (email, newPassword) => {
  await wait(1000);

  const response = await client.post('/reset-password', { email, newPassword });

  return response.data;
};

export const refresh = async () => {
  const response = await client.get('/refresh');

  return response.data;
};
