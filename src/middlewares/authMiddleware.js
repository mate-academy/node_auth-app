import { jwt } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  console.log(accessToken);

  if (!accessToken) {
    return tryRefreshToken(req, res);
  }

  // if (!accessToken) return res.status(401).send('Unauthorized');

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  next();
};

const tryRefreshToken = (req, res) => {
  res.redirect('/refresh');
};
