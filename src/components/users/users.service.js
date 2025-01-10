'use strict';

const { hash } = require('bcrypt');

const UsersRepository = require('./users.repository');

const hashPassword = (password) => {
  const saltRounds = +process.env.SALT_ROUNDS;

  return hash(password, saltRounds);
};

const save = async (email, password, activationToken) => {
  const hashedPassword = await hashPassword(password);

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

const findOneByActivationToken = async (activationToken) => {
  const user = await UsersRepository.findOneByActivationToken(activationToken);

  user.activationToken = null;

  return user;
};

const getOneByEmail = (email) => {
  return UsersRepository.findOneByEmail(email);
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
  hashPassword,
};
