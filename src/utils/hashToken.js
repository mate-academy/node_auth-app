// eslint-disable-next-line no-shadow
import crypto from 'node:crypto';

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
