import jwt from 'jsonwebtoken';
import 'dotenv/config';

function sigh(user) {
  try {
    const token = jwt.sign(user, process.env.JWT_KEY, {
      expiresIn: '1500s',
    });

    return token;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function resetPasswordToken(user) {
  try {
    const token = jwt.sign(user, process.env.JWT_RESET_KEY, {
      expiresIn: '300s',
    });

    return token;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

function refreshSigh(user) {
  try {
    const token = jwt.sign(user, process.env.JWT_REFRESH_KEY, {
      expiresIn: '30d',
    });

    return token;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function refreshVerify(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  sigh,
  resetPasswordToken,
  verify,
  refreshSigh,
  refreshVerify,
};
