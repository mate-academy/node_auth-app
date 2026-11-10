import { User } from '../../models/User.model.js';

function getByEmail(email: string) {
  return User.findOne({
    where: { email },
  });
}

function create({ name, email, password, activationToken }) {
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
  create,
  activate,
  update,
};
