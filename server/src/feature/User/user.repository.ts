import { User } from '../../models/User.model.js';
import type { CreateUserData } from './types.js';

function getAll() {
  return User.findAll();
}

function getByEmail(email: string) {
  return User.findOne({
    where: { email },
  });
}

function getById(id: number) {
  return User.findByPk(id);
}

function create({ name, email, password, activationToken }: CreateUserData) {
  return User.create({ name, email, password, activationToken });
}

function activate(email: string) {
  return User.update(
    {
      activationToken: null,
    },
    {
      where: {
        email,
      },
    }
  );
}

async function update(id: number, data: Partial<Omit<User, "id">>) {
  await User.update(
    { ...data },
    {
      where: {
        id,
      },
    },
  );

  return User.findByPk(id);
}

export const userRepository = {
  getByEmail,
  getById,
  create,
  activate,
  update,
  getAll,
};
