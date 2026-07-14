import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { NormalizedUser } from './user.service.ts';

function activationTokenSign(user: NormalizedUser) {
  const JWT_ACTIVATION_SECRET = process.env.JWT_ACTIVATION_SECRET;

  if (!JWT_ACTIVATION_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    throw new Error('Not found JWT_ACTIVATION_SECRET');
  }

  return jwt.sign(user, JWT_ACTIVATION_SECRET, { expiresIn: '30min' });
}

function activationTokenVerify(
  token: string,
): (JwtPayload & NormalizedUser) | null {
  const JWT_ACTIVATION_SECRET = process.env.JWT_ACTIVATION_SECRET;

  if (!JWT_ACTIVATION_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_ACTIVATION_SECRET);

    if (typeof payload === 'string') {
      return null;
    }

    return payload as JwtPayload & NormalizedUser;
  } catch (e) {
    return null;
  }
}

function resetEmailTokenSign(user: NormalizedUser & { newEmail: string }) {
  const JWT_RESET_EMAIL_SECRET = process.env.JWT_RESET_EMAIL_SECRET;

  if (!JWT_RESET_EMAIL_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    throw new Error('Not found JWT_ACTIVATION_SECRET');
  }

  return jwt.sign(user, JWT_RESET_EMAIL_SECRET, {
    expiresIn: '30min',
  });
}

function resetEmailTokenVerify(
  token: string,
): (JwtPayload & NormalizedUser & { newEmail: string }) | null {
  const JWT_RESET_EMAIL_SECRET = process.env.JWT_RESET_EMAIL_SECRET;

  if (!JWT_RESET_EMAIL_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_RESET_EMAIL_SECRET);

    if (typeof payload === 'string') {
      return null;
    }

    return payload as JwtPayload & NormalizedUser & { newEmail: string };
  } catch (e) {
    return null;
  }
}

function resetPasswordTokenSign(user: NormalizedUser) {
  const JWT_RESET_PASSWORD_SECRET = process.env.JWT_RESET_PASSWORD_SECRET;

  if (!JWT_RESET_PASSWORD_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    throw new Error('Not found JWT_ACTIVATION_SECRET');
  }

  return jwt.sign(user, JWT_RESET_PASSWORD_SECRET, {
    expiresIn: '30min',
  });
}

function resetPasswordTokenVerify(
  token: string,
): (JwtPayload & NormalizedUser) | null {
  const JWT_RESET_PASSWORD_SECRET = process.env.JWT_RESET_PASSWORD_SECRET;

  if (!JWT_RESET_PASSWORD_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_RESET_PASSWORD_SECRET);

    if (typeof payload === 'string') {
      return null;
    }

    return payload as JwtPayload & NormalizedUser & { newEmail: string };
  } catch (e) {
    return null;
  }
}

function accessTokenSign(user: NormalizedUser) {
  const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

  if (!JWT_ACCESS_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    throw new Error('Not found JWT_ACTIVATION_SECRET');
  }

  return jwt.sign(user, JWT_ACCESS_SECRET, { expiresIn: '30min' });
}

function accessTokenVerify(
  token: string,
): (JwtPayload & NormalizedUser) | null {
  const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

  if (!JWT_ACCESS_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);

    if (typeof payload === 'string') {
      return null;
    }

    return payload as JwtPayload & NormalizedUser;
  } catch (e) {
    return null;
  }
}

function refreshTokenSign(user: NormalizedUser) {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  if (!JWT_REFRESH_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    throw new Error('Not found JWT_ACTIVATION_SECRET');
  }

  return jwt.sign(user, JWT_REFRESH_SECRET, { expiresIn: '10d' });
}

function refreshTokenVerify(
  token: string,
): (JwtPayload & NormalizedUser) | null {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  if (!JWT_REFRESH_SECRET) {
    console.error('Not found JWT_ACTIVATION_SECRET');
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET);

    if (typeof payload === 'string') {
      return null;
    }

    return payload as JwtPayload & NormalizedUser;
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  activationToken: { verify: activationTokenVerify, sign: activationTokenSign },
  accessToken: { verify: accessTokenVerify, sign: accessTokenSign },
  refreshToken: { verify: refreshTokenVerify, sign: refreshTokenSign },
  resetEmailToken: { verify: resetEmailTokenVerify, sign: resetEmailTokenSign },
  resetPasswordToken: {
    verify: resetPasswordTokenVerify,
    sign: resetPasswordTokenSign,
  },
};
