const { db } = require('../utils/db.js');

const create = (userId, newEmail, token) => {
  return db.changeEmailToken.create({
    data: { userId, newEmail, token },
  });
};

const getToken = (token) => {
  return db.changeEmailToken.findFirst({
    where: { token },
    include: { user: true },
  });
};

const remove = (token) => {
  return db.changeEmailToken.delete({
    where: { token },
    include: { user: true },
  });
};

module.exports = {
  create,
  getToken,
  remove,
};
