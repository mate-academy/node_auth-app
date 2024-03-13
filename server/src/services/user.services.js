const User = require("../modules/user");

const getAllActivated = () => User.findAll();

const normalize = ({ id, email }) => {
  return { id, email };
};

module.exports = { getAllActivated, normalize };
