const User = require("../models/user");

const getAllActivated = () =>
  User.findAll({ where: { activationToken: null } });

const normalize = ({ id, email }) => {
  return { id, email };
};

module.exports = { getAllActivated, normalize };
