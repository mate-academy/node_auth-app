import { compareSync, hashSync } from 'bcrypt';

const sync = (data, salt = 7) => {
  return hashSync(data, salt);
};

const compare = (data, hash) => {
  return compareSync(data, hash);
};

const encryptService = {
  sync: (data, salt) => sync(data, salt),
  compare: (data, hash) => compare(data, hash),
};

export default encryptService;
