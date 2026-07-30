import { ApiError } from '../exeptions/apiError.js';
import { User } from '../models/userModel.js';
import { emailServices } from '../services/emailServices.js';
import { v4 as uuidv4 } from 'uuid';
import { Token } from '../models/token.js';

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

export const userServices = {
  normalized,
  findByEmail,
  register,
  recover,
  remove,
};
