const key = 'accessToken';

function get(): string | null {
  return localStorage.getItem(key);
}

function save(token: string): void {
  return localStorage.setItem(key, token);
}

function remove(): void {
  return localStorage.removeItem(key);
}

export const accessTokenService = {
  get,
  save,
  remove,
};
