import axios from 'axios';

export type ApiErrorBody = { message?: string; code?: string };

export function getApiErrorBody(error: unknown): ApiErrorBody | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as Record<string, unknown> | undefined;
  if (!data) return null;

  const backendBody = data.backendBody as Record<string, unknown> | undefined;
  if (backendBody && typeof backendBody.message === 'string') {
    return {
      message: backendBody.message,
      code: (data.code as string | undefined) ?? 'INVALID_CREDENTIALS',
    };
  }

  const nested = data.message;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as ApiErrorBody;
  }
  if (typeof nested === 'string') {
    return { message: nested, code: data.code as string | undefined };
  }
  if (Array.isArray(nested) && typeof nested[0] === 'string') {
    return { message: nested[0], code: data.code as string | undefined };
  }
  return null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const body = getApiErrorBody(error);
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;

  if (status === 401) {
    return 'Invalid email or password. Please try again.';
  }

  if (!body) return fallback;

  if (body.code === 'INVALID_PASSWORD' || body.code === 'INVALID_CREDENTIALS') {
    return 'Invalid email or password. Please try again.';
  }
  if (body.code === 'EMAIL_IN_USE') return 'This email is already in use';
  if (body.message === 'Invalid credentials') {
    return 'Invalid email or password. Please try again.';
  }
  if (body.message) return body.message;
  return fallback;
}
