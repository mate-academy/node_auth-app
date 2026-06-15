const { db } = require('../utils/db.js');

const createToken = (token, userId) => {
  return db.resetPasswordToken.create({ data: { tokenHash: token, userId } });
};

const getToken = (token) => {
  return db.resetPasswordToken.findFirst({
    where: {
      tokenHash: token,
    },
    include: {
      user: true,
    },
  });
};

const deleteToken = (tokenHash) => {
  return db.resetPasswordToken.delete({ where: { tokenHash } });
};

const deletByUserId = (userId) => {
  return db.resetPasswordToken.deleteMany({ where: { userId } });
};

module.exports = {
  createToken,
  getToken,
  deleteToken,
  deletByUserId,
};
