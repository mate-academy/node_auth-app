import { User } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { ApiError } from '../exceptions/api.error.js';

function generateActivationToken() {
  return uuidv4();
}

async function consumeActivationToken(user) {
  user.activationToken = null;
  await user.save();
}

function createJwt(data) {
  return jwt.sign(data, process.env.JWT_SECRET);
}

async function getAll() {
  return User.findAll({
    attributes: ['id', 'name', 'email', 'activationToken'],
  });
}

async function getById(id) {
  return User.findByPk(id);
}

async function getByEmail(email) {
  return User.findOne({ where: { email } });
}

async function getByActivationToken(activationToken) {
  return User.findOne({
    where: { activationToken },
    attributes: ['id', 'name', 'email'],
  });
}

async function create({ name, email, password, activationToken }) {
  const userExists = await getByEmail(email);

  if (userExists) {
    throw ApiError.BadRequest('User already exists', {
      email: 'This e-mail address is used by another user',
    });
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    activationToken,
  });

  return { id: user.id, name: user.name, email: user.email };
}

export const usersService = {
  generateActivationToken,
  consumeActivationToken,
  createJwt,
  getAll,
  getById,
  getByEmail,
  getByActivationToken,
  create,
};
