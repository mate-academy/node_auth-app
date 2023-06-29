'use strict';

const { hash } = require('bcrypt');

const UsersRepository = require('./users.repository');

const save = async(email, password, activationToken) => {
  const hashedPassword = await hash(password, 10);

  const newUser = await UsersRepository.create(
    email,
    hashedPassword,
    activationToken,
  );

  return newUser;
};

const getAll = () => {
  return UsersRepository.findAll();
};

const getOne = (id) => {
  return UsersRepository.findOne(id);
};

const findOneByActivationToken = (activationToken) => {
  return UsersRepository.findOneByActivationToken(activationToken);
};

const getOneByEmail = async(email) => {
  const user = await UsersRepository.findOneByEmail(email);

  if (!user) {
    return 'User not found';
  }

  return user;
};

const updatePassword = (password, id) => {
  return UsersRepository.updatePassword(password, id);
};

module.exports = {
  save,
  getAll,
  getOne,
  findOneByActivationToken,
  getOneByEmail,
  updatePassword,
};
