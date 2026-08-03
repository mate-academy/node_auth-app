const { ApiError } = require('../exeptions/apiError.js');
const { User } = require('../models/userModel.js');
const { emailServices } = require('../services/emailServices.js');
const { v4: uuidv4 } = require('uuid');
const { Token } = require('../models/token.js');

const normalized = ({ id, name, email }) => {
  return { id, name, email };
};

const findByEmail = async (email) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });

  return user;
};

const register = async (name, email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  } else {
    const createUser = await User.create({
      name,
      email,
      password,
      activationToken,
    });

    await emailServices.sendActivation(email, activationToken);

    return createUser;
  }
};

const recover = async (email) => {
  const existUser = await findByEmail(email);
  const activationToken = uuidv4();

  if (!existUser) {
    throw ApiError.badRequest('User does not exist; sign up.', {
      email: 'User does not exist; sign up.',
    });
  } else {
    existUser.activationToken = activationToken;
    await existUser.save();

    await emailServices.sendRecover(email, activationToken);

    return normalized(existUser);

    // const updateUser = await
    // User.update({activationToken}, {where: {email}, returning: true})
    // return updateUser[1][0];
  }
};

const remove = (UserId) => {
  return Token.destroy({ where: { UserId } });
};

const userServices = {
  normalized,
  findByEmail,
  register,
  recover,
  remove,
};

module.exports = {
  userServices,
};
