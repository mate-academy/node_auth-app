const User = require("../modules/user");

const getAll = () => User.findAll();

const getByEmail = (email) => User.findOne({ where: { email } });

const create = ({ email, password }) => {
  console.log("create");
  return User.create({ email, password });
};

const normalize = ({ id, email }) => {
  return { id, email };
};

module.exports = {
  getAll,
  getByEmail,
  create,
  normalize,
};
