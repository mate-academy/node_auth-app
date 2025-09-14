import jwt from 'jsonwebtoken';

const JWT_CONFIG = {
  access: {
    key: process.env.JWT_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  refresh: {
    key: process.env.JWT_REFRESH_KEY,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
};

if (!JWT_CONFIG.access.key) {
  throw new Error('JWT_KEY is not defined in environment variables');
}

if (!JWT_CONFIG.refresh.key) {
  throw new Error('JWT_REFRESH_KEY is not defined in environment variables');
}

const extractPayload = (user) => {
  if (!user || typeof user !== 'object') {
    return {};
  }

  return { id: user.id, email: user.email };
};

const signToken = (user, type = 'access') => {
  const payload = extractPayload(user);
  const { key, expiresIn } = JWT_CONFIG[type];

  return jwt.sign(payload, key, { expiresIn });
};

const verifyToken = (token, type = 'access') => {
  const { key } = JWT_CONFIG[type];

  try {
    return jwt.verify(token, key);
  } catch {
    return null;
  }
};

export const jwtService = {
  sign: (user) => signToken(user, 'access'),
  verify: (token) => verifyToken(token, 'access'),
  signRefresh: (user) => signToken(user, 'refresh'),
  verifyRefresh: (token) => verifyToken(token, 'refresh'),
};
