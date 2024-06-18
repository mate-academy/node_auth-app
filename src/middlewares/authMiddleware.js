const { response } = require('../constants/response');
const { verify } = require('../services/jwt.service');

function authMiddleware(req, res, next) {
  const authorization = req.headers['authorization'] || '';

  const token = authorization.split(' ')[1];

  if (!token) {
    res
      .status(response[401].statusCode)
      .json({ message: response[401].messages.unauthorized });

    return;
  }

  const userData = verify(token);

  if (!userData) {
    res
      .status(response[401].statusCode)
      .json({ message: response[401].messages.unauthorizedSignin });

    return;
  }

  next();
}

module.exports = { authMiddleware };
