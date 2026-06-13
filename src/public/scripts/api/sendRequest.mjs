const BASE_URL = 'http://localhost:3000';

export const sendRequest = (
  path,
  payload,
  method = payload ? 'POST' : 'GET',
) => {
  const options = {
    method,
  };

  if (payload) {
    options.headers = {
      'Content-Type': 'application/json',
    };

    options.body = JSON.stringify(payload);
  }

  return fetch(BASE_URL + path, options);
};
