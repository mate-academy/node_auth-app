import jwt from 'jsonwebtoken';

function sign(user) {
  return jwt.sign({ user }, process.env.JWT_KEY, {
    expiresIn: process.env.EXP_IN,
  });
}

function signRefresh(user) {
  return jwt.sign({ user }, process.env.JWT_KEY_REFRESH, {
    expiresIn: process.env.EXP_IN_REFRESH,
  });
}

function signPasswordRequest(userId, jti) {
  return jwt.sign(
    { id: userId, purpose: 'password-reset', jti },
    process.env.JWT_KEY_PASSWORD_RESET,
    {
      expiresIn: process.env.EXP_IN_PASSWORD_RESET,
    },
  );
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    return null;
  }
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY_REFRESH);
  } catch (error) {
    return null;
  }
}

function verifyPasswordReset(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY_PASSWORD_RESET);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
  signRefresh,
  signPasswordRequest,
  verifyRefresh,
  verifyPasswordReset,
};
