const { User } = require('../models/User.model');
const jwtService = require('../services/jwt.service');

const getByActivationToken = async (activationToken) => {
  return User.findOne({ where: { activationToken } });
};

const getByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const getById = async (id) => {
  return User.findOne({ where: { id } });
};

const getByAccessToken = async (accessToken) => {
  const { id } = await jwtService.verify(accessToken);
  const user = await getById(id);

  return user;
};

const normalize = ({ id, email }) => {
  return { id, email };
};

module.exports = {
  getByActivationToken,
  getByEmail,
  getById,
  getByAccessToken,
  normalize,
};
