import jwt from "jsonwebtoken";
import "dotenv/config";

function signAccess(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET || process.env.JWT_KEY, {
    expiresIn: "1h",
  });
}

function signRefresh(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET || process.env.JWT_KEY, {
    expiresIn: "30d",
  });
}

function verifyAccess(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_KEY);
  } catch {
    return null;
  }
}

function verifyRefresh(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_KEY);
  } catch {
    return null;
  }
}

export const jwtService = {
  sign: signAccess,
  verify: verifyAccess,
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
};

