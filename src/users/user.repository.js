const { hashData } = require('../utils/hash');
const { User } = require('./user.model');
const { v4: uuidv4 } = require('uuid');

const getById = (id) => {
  return User.findByPk(+id);
};

const add = async ({ name, email, password }) => {
  return User.create({
    name,
    email,
    password: await hashData(password),
    activationToken: uuidv4(),
  });
};

const update = async (id, data) => {
  const [updatedCount, updatedRows] = await User.update(data, {
    where: {
      id,
    },
    returning: true,
  });

  if (updatedCount === 0) {
    return;
  }

  return updatedRows[0];
};

const getByEmail = (email) => {
  return User.findOne({
    where: {
      email,
    },
  });
};

module.exports = {
  getById,
  add,
  update,
  getByEmail,
};
