import { db } from '../db.js';

const create = ({ email, name, password, activationToken }) => {
  return db.user.create({
    data: {
      email,
      password,
      name,
      activationToken,
    },
  });
};

function getByEmail(email) {
  return db.user.findUnique({
    where: { email },
  });
}

function activation(email) {
  return db.user.update({
    where: { email },
    data: { activationToken: null },
  });
}

export const authService = {
  create,
  getByEmail,
  activation,
};
