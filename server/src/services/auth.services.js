const User = require("../models/user");

const getAll = () => User.findAll();

const getByEmail = (email) => User.findOne({ where: { email } });

const getByActivationToken = (activationToken) =>
  User.findOne({ where: { activationToken } });

const create = ({ email, password, activationToken }) => {
  return User.create({ email, password, activationToken });
};

const normalize = ({ id, email }) => {
  return { id, email };
};

module.exports = {
  getAll,
  getByEmail,
  getByActivationToken,
  create,
  normalize,
};
