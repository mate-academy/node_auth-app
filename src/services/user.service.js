import User from '../models/User.js';

export const secureUser = ({ email, name }) => {
  return {
    email,
    name,
  };
};

export const findUser = (email) => User.findOne({ where: { email } });

export const findUserByActivationToken = (activationToken) =>
  User.findOne({ where: { activationToken } });

export const findUserByResetPasswordToken = (resetPasswordToken) =>
  User.findOne({ where: { resetPasswordToken } });

export const findUserByActivationNewEmailToken = (activationNewEmailToken) =>
  User.findOne({ where: { activationNewEmailToken } });

export const createUser = async ({
  email,
  password,
  name,
  activationToken,
}) => {
  const user = await User.create({
    email,
    password,
    name,
    activationToken,
  });

  return user;
};
