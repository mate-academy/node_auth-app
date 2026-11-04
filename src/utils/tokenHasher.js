import { createHash } from 'node:crypto';

export const sha256 = (value) => {
  return createHash('sha256').update(value).digest('hex');
};
