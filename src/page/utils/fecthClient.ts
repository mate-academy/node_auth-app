const BASE_URL = 'http://localhost:3005';

export const postData = <T>(url: string, data: T) => {
  return fetch(BASE_URL + url, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
    credentials: 'include',
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.message || `${response.status}: ${response.statusText} `,
      );

      (error as any).errors = errorData.errors;

      throw error;
    }

    return response.json();
  });
};

export const postLogout = (url: string) => {
  return fetch(BASE_URL + url, {
    method: 'POST',
    credentials: 'include',
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.message || `${response.status}: ${response.statusText} `,
      );

      (error as any).errors = errorData.errors;

      throw error;
    }
  });
};

export const getUser = (url: string) => {
  return fetch(BASE_URL + url, {
    method: 'GET',
    credentials: 'include',
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.message || `${response.status}: ${response.statusText} `,
      );

      (error as any).errors = errorData.errors;

      throw error;
    }

    return response.json();
  });
};

export const getUserAutentication = (url: string) => {
  return fetch(BASE_URL + url, {
    method: 'GET',
    credentials: 'include',
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`erro: ${response.status}`);
    }

    return response.json();
  });
};

export const uptdateUser = <T>(url: string, data: T) => {
  return fetch(BASE_URL + url, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json; charset=UTF-8' },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.message || `${response.status}: ${response.statusText} `,
      );

      (error as any).errors = errorData.errors;

      throw error;
    }

    return response.json();
  });
};
