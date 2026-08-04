const authRepository = require('../repositories/auth.repository.js');

async function requestValidation(req, res, next) {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).send('Unauthorized.');
  }

  const tokenData = await authRepository.findTokenByToken(accessToken);

  if (!tokenData) {
    return res.status(401).send('Unauthorized.');
  }

  const user = await authRepository.findUserById(tokenData.userId);

  if (!user) {
    await authRepository.deleteTokenByUserId(tokenData.userId);

    return res.status(401).send('Unauthorized.');
  }

  req.user = user;

  next();
}

module.exports = {
  requestValidation,
};
