import { User } from '../../models/User.model.js';

async function getAll() {
  return User.findAll();
}

async function getById(id) {
  return User.findByPk(id);
}

async function create({ name }) {
  return User.create({ name });
}

async function update({ id, name }) {
  await User.update(
    { name },
    {
      where: {
        id,
      },
    },
  );

  return User.findByPk(id);
}

async function deleteById(id) {
  return User.destroy({
    where: {
      id,
    },
  });
}

export const userService = {
  getAll,
  getById,
  create,
  update,
  deleteById,
};
