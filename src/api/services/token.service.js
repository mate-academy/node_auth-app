const { Token } = require('../models/token.model');

const create = async (userId, token) => {
  return Token.create({
    data: { userId, token },
  });
};

const getByToken = (token) => {
  return Token.findFirst({
    where: {
      token,
    },
  });
};

const deleteByUserId = (userId) => {
  return Token.destroy({
    where: {
      userId,
    },
  });
};

const TokenServices = {
  create,
  getByToken,
  deleteByUserId,
};

module.exports = {
  TokenServices,
};
