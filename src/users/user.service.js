const AppError = require('../utils/appError');
const repository = require('./user.repository');

const register = async ({ name, email, password }) => {
  if (await repository.getByEmail(email)) {
    throw new AppError('This email is already used.', 400);
  }

  const user = await repository.add({ name, email, password });

  return user;
};

const getByEmail = (email) => {
  return repository.getByEmail(email);
};

const update = (id, data) => {
  return repository.update(id, data);
};

const normalize = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

module.exports = {
  register,
  normalize,
  getByEmail,
  update,
};
