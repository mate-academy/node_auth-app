/* eslint-disable no-console */
import jwt from 'jsonwebtoken';

export const authmiddleware = (req, res, next) => {
  const auth = req.headers.authorisation;

  if (!auth) {
    res.sendStatus(401);

    return;
  }

  const [, token] = auth.split(' ');

  if (!token) {
    res.sendStatus(401);

    return;
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);

    console.log(data);
    next();
  } catch (error) {
    res.sendStatus(401);
  }
};
