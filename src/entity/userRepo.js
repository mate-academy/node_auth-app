const { db } = require('../utils/db.js');

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const getByEmail = (email) => {
  return db.user.findFirst({ where: { email } });
};

const getById = (id) => {
  return db.user.findFirst({ where: { id } });
};

const create = (data) => {
  return db.user.create({ data });
};

const updateUser = (data, where) => {
  return db.user.update({ data, where });
};

const changePassword = (password, id) => {
  return updateUser({ password }, { id });
};

module.exports = {
  normalize,
  create,
  getByEmail,
  updateUser,
  changePassword,
  getById,
};
