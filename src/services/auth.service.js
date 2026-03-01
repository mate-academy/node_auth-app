import { v4 as uuidv4 } from 'uuid';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const canResendActivation = (user) => {
  if (!user.lastActivationEmailSentAt) {
    return true;
  }

  const now = Date.now();
  const lastUpdate = new Date(user.lastActivationEmailSentAt).getTime();

  return now - lastUpdate >= FIFTEEN_MINUTES;
};

const generateActivationToken = () => {
  return uuidv4();
};

const getPasswordExpiresAt = () => {
  return new Date(Date.now() + FIFTEEN_MINUTES);
};

export const authService = {
  canResendActivation,
  generateActivationToken,
  getPasswordExpiresAt,
};
