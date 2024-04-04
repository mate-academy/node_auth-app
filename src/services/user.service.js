import { User } from '../models/user.js';

const getAllActivated = () => {
  return User.findAll({
    where: {
      activationToken: null,
    }
  })
};

const getByEmail = (email) => {
  return User.findOne({
    where: {
      email,
    }
  })
}

const getByToken = (activationToken) => {
  return User.findOne({
    where: {
      activationToken,
    }
  })
}

const create = (name, email, password, activationToken) => {
  return User.create({
    name,
    email,
    password,
    activationToken,
  });
};

const normalize = ({ id, name, email }) => {
  return {id, name, email};
}

export const userService = {
  getAllActivated,
  getByEmail,
  getByToken,
  create,
  normalize,
}