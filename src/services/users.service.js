import { User } from '../models/user.model.js';

async function consumeActivationToken(user) {
  user.activationToken = null;
  await user.save();
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

async function create({ name, email, passwordHash, activationToken }) {
  const user = await User.create({
    name,
    email,
    passwordHash,
    activationToken,
  });

  return { id: user.id, name: user.name, email: user.email };
}

export const usersService = {
  consumeActivationToken,
  getAll,
  getById,
  getByEmail,
  getByActivationToken,
  create,
};
