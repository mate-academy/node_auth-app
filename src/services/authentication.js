'use strict';

const { verifyAccessToken } = require('./jwt-service');

const checkAuthHeader = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: 'Acesso negado; Cabeçalho Authorization inválido.' });
  }

  const bearerHeader = authHeader.split(' ');

  if (bearerHeader.length !== 2 || bearerHeader[0] !== 'Bearer') {
    return res.status(401).json({
      message: 'Acesso Negado: Cabeçalho Authorization inválido. ',
    });
  }

  try {
    const userVerify = verifyAccessToken(bearerHeader[1]);

    req.user = userVerify;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Ocoreu um erro ao verificar o seu acesso.' });
  }
};

module.exports = checkAuthHeader;
