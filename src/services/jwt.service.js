import jwt from 'jsonwebtoken';
import 'dotenv/config';

const sign = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
  return token;
};

const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const signRefresh = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '1h' },
  );
  return token;
};

const verifyRefresh = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

const signReset = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_RESET_SECRET,
    { expiresIn: '1h' },
  );
  return token;
};

const verifyReset = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_RESET_SECRET);
  } catch (error) {
    return null;
  }
};

export const JWTService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
  signReset,
  verifyReset,
};
