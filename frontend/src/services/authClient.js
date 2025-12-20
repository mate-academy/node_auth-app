import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const useMock = !API_BASE_URL;
const MOCK_USER_KEY = 'auth_mock_user';
const MOCK_RESET_TOKEN_KEY = 'auth_mock_reset';
const MOCK_AUTH_TOKEN = 'mock-auth-token';

const api = API_BASE_URL
  ? axios.create({
      baseURL: API_BASE_URL,
    })
  : null;

const delay = (value) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), 350);
  });

const maskUser = (user) =>
  user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        active: Boolean(user.active),
      }
    : null;

const getMockUser = () => {
  const stored = localStorage.getItem(MOCK_USER_KEY);

  return stored ? JSON.parse(stored) : null;
};

const saveMockUser = (user) => {
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
};

const removeMockUser = () => {
  localStorage.removeItem(MOCK_USER_KEY);
};

const ensureUser = () => {
  const user = getMockUser();

  if (!user) {
    throw new Error('Спершу зареєструйтесь.');
  }

  return user;
};

async function register(payload) {
  if (!useMock) {
    const { data } = await api.post('/auth/register', payload);

    return data;
  }

  const user = {
    ...payload,
    id: `mock-${Date.now()}`,
    active: false,
  };

  saveMockUser(user);

  return delay({
    user: maskUser(user),
    token: MOCK_AUTH_TOKEN,
    message: 'Ми надіслали лист для активації. Перевірте пошту.',
  });
}

async function activate(token) {
  if (!useMock) {
    const { data } = await api.post('/auth/activate', { token });

    return data;
  }

  const user = ensureUser();
  user.active = true;
  saveMockUser(user);

  return delay({
    user: maskUser(user),
    token: MOCK_AUTH_TOKEN,
    message: 'Акаунт активовано',
  });
}

async function login(payload) {
  if (!useMock) {
    const { data } = await api.post('/auth/login', payload);

    return data;
  }

  const user = ensureUser();

  if (user.email !== payload.email || user.password !== payload.password) {
    throw new Error('Невірний email або пароль.');
  }

  return delay({
    user: maskUser(user),
    token: MOCK_AUTH_TOKEN,
    needsActivation: !user.active,
  });
}

async function logout(token) {
  if (!useMock) {
    await api.post(
      '/auth/logout',
      {},
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      },
    );
  }
}

async function me(token) {
  if (!useMock) {
    const { data } = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  }

  const user = ensureUser();

  return delay({ user: maskUser(user) });
}

async function requestReset({ email }) {
  if (!useMock) {
    const { data } = await api.post('/auth/reset/request', { email });

    return data;
  }

  const user = getMockUser();

  if (!user || user.email !== email) {
    return delay({
      message: 'Якщо такий email існує, ми надіслали інструкцію.',
    });
  }

  const token = `reset-${Date.now()}`;

  localStorage.setItem(MOCK_RESET_TOKEN_KEY, token);

  return delay({
    message: 'Ми надіслали лист для відновлення пароля.',
    token,
  });
}

async function resetPassword({ token, password }) {
  if (!useMock) {
    const { data } = await api.post('/auth/reset/confirm', {
      token,
      newPassword: password,
    });

    return data;
  }

  const savedToken = localStorage.getItem(MOCK_RESET_TOKEN_KEY);

  if (!token || savedToken !== token) {
    throw new Error('Невірний або прострочений токен.');
  }

  const user = ensureUser();
  user.password = password;
  saveMockUser(user);
  localStorage.removeItem(MOCK_RESET_TOKEN_KEY);

  return delay({ message: 'Пароль оновлено.' });
}

async function updateProfile(payload, token) {
  if (!useMock) {
    const { data } = await api.patch('/auth/profile', payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });

    return data;
  }

  const user = ensureUser();
  const updated = { ...user };

  if (payload.name) {
    updated.name = payload.name;
  }

  saveMockUser(updated);

  return delay({ user: maskUser(updated), message: 'Дані оновлено.' });
}

async function changePassword({ oldPassword, newPassword }, token) {
  if (!useMock) {
    const { data } = await api.post(
      '/auth/password',
      { oldPassword, newPassword },
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      },
    );

    return data;
  }

  const user = ensureUser();

  if (user.password !== oldPassword) {
    throw new Error('Старий пароль не збігається.');
  }

  user.password = newPassword;
  saveMockUser(user);

  return delay({ message: 'Пароль змінено.' });
}

async function changeEmail({ password, newEmail }, token) {
  if (!useMock) {
    const { data } = await api.post(
      '/auth/email',
      { password, newEmail },
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      },
    );

    return data;
  }

  const user = ensureUser();

  if (user.password !== password) {
    throw new Error('Пароль не підходить.');
  }

  user.email = newEmail;
  saveMockUser(user);

  return delay({ user: maskUser(user), message: 'Email змінено. Ми повідомили стару адресу.' });
}

export const authClient = {
  register,
  activate,
  login,
  logout,
  me,
  requestReset,
  resetPassword,
  updateProfile,
  changePassword,
  changeEmail,
};
