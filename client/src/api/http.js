const API_URL = 'http://localhost:3005';

const NO_REFRESH_PATHS = ['/login', '/register', '/refresh', '/logout'];

let accessToken = null;
let refreshPromise = null;
let onAuthFail = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setOnAuthFail = (fn) => {
  onAuthFail = fn;
};

async function send(path, { method = 'GET', body } = {}) {
  const headers = {};

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not connect to the server.');
  }

  const data = await response.json().catch(() => null);

  return { response, data };
}

function toError(response, data) {
  const error = new Error(data?.message || 'Something went wrong.');

  error.status = response.status;
  error.errors = data?.errors || null;

  return error;
}

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = send('/refresh', { method: 'GET' })
      .then(({ response, data }) => {
        if (!response.ok) throw toError(response, data);
        accessToken = data.accessToken;
        return data; // { user, accessToken }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function request(path, options = {}) {
  let { response, data } = await send(path, options);

  if (response.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
    try {
      await refreshSession();
    } catch {
      onAuthFail();
      throw toError(response, data);
    }

    ({ response, data } = await send(path, options));
  }

  if (!response.ok) {
    throw toError(response, data);
  }

  return data;
}
