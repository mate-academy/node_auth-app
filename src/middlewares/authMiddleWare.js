const { jwtService } = require('../services/jwt.service.js');

const authMiddleWare = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ error: 'Authorization token is missing' });
  }

  try {
    const userData = jwtService.verify(token);

    if (!userData) {
      return res.status(401).send({ error: 'Invalid token' });
    }

    req.user = userData;
    next();
  } catch (err) {
    return res.status(401).send({ error: 'Token verification failed' });
  }
};

module.exports = { authMiddleWare };
