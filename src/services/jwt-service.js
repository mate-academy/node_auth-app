import jwt from "jsonwebtoken";

export const createAccessToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '5s' });
}   

export const readAccessToken = (token) => {
    try {
 return jwt.verify(token, process.env.JWT_SECRET);
} catch (error) {
        return null;
    }
}

export const createRefreshToken = (data) => {

    return jwt.sign(data, process.env.JWT_SECRET_REFRESH, { expiresIn: '10d'});
}

export const readRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_REFRESH);
    } catch (error) {
        return null;
    }
}
