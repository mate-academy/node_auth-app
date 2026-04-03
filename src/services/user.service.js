/* eslint-disable */
const { ApiError } = require('../controllers/exeptions/api.error');
const { User } = require('../models/User');
const { sendActivationEmail } = require('../services/email.service.js');
const { v4: uuidv4 } = require('uuid');

const getAllActivated = () => {
  return User.findAll({
    where: {
      activationToken: null
    }
  })
}

const normalize = ({ id, email, name }) => {
  return {
    id,
    email,
    name
  }
}

const findByEmail = (email) => {
  return User.findOne({ where: { email } })
}

const register = async (name, email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if(existUser) {
    throw  ApiError.badRequest('User already exist', {
      email: 'User already exist'
    });
  }

  const newUser = await User.create({ name, email, password, activationToken });
  await sendActivationEmail(email, activationToken);
 
}

const findById = (id) => {
  return User.findByPk(id);
};

module.exports = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  findById
};
