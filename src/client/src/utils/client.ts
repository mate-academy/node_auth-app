const BE_URL = import.meta.env.VITE_API_URL;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ErrorResponse = {
  message?: string;
};

async function request<T>(
  url: string,
  method: RequestMethod = 'GET',
  data: unknown = null,
): Promise<T> {
  const options: RequestInit = { method, credentials: 'include' };

  if (data) {
    options.headers = {
      'Content-Type': 'application/json; charset=UTF-8',
    };

    options.body = JSON.stringify(data);
  }

  const response = await fetch(BE_URL + url, options);

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;
    const message = errorData?.message || 'Request failed';

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const client = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) => request<T>(url, 'POST', data),
  put: <T>(url: string, data: unknown) => request<T>(url, 'PUT', data),
  patch: <T>(url: string, data: unknown) => request<T>(url, 'PATCH', data),
  delete: <T>(url: string) => request<T>(url, 'DELETE'),
};
