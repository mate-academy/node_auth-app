import { User } from '../models/User.js';

async function getByEmail(email) {
  return User.findOne({ where: { email } });
}

async function create(data) {
  return User.create(data);
}

async function getById(id) {
  return User.findByPk(id);
}

async function activate(email) {
  return User.update(
    {
      activationLink: null,
      isActivated: true,
    },
    { where: { email }, returning: true },
  );
}

async function getAllActive() {
  return User.findAll({ where: { activationLink: null } });
}

async function setResetToken(email, resetToken) {
  return User.update({ resetToken }, { where: { email } });
}

async function updatePassword(id, password) {
  return User.update({ password }, { where: { id } });
}

async function updateEmail(id, newEmail, activationLink) {
  return User.update({ email: newEmail, activationLink }, { where: { id } });
}

async function updateName(id, name) {
  return User.update({ name }, { where: { id } });
}

export const usersRepository = {
  getByEmail,
  create,
  getById,
  activate,
  getAllActive,
  setResetToken,
  updatePassword,
  updateEmail,
  updateName,
};
