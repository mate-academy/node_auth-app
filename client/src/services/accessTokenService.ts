const key = 'accessToken';

export const accessTokenService = {
  get: () => localStorage.getItem(key),
  save: (token: string) => localStorage.setItem(key, token),
  remove: () => localStorage.removeItem(key),
};
