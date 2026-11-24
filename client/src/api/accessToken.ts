const KEY = 'accessToken';

const save = (value: string) => {
  localStorage.setItem(KEY, value);
};
const get = () => {
  return localStorage.getItem(KEY);
};
const remove = () => {
  localStorage.removeItem(KEY);
};

export const accessTokenService = {
  save,
  get,
  remove,
};
