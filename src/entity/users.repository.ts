import { client } from '../utils/db';

function create(email: string, password: string, activationToken?: string) {
  return client.user.create({
    data: { email, password, activationToken },
  });
}

function getByEmail(email: string) {
  return client.user.findUnique({
    where: { email },
  });
}

function activate(email: string) {
  return client.user.update({
    where: { email },
    data: {
      isActivated: true,
      activationToken: null,
    },
  });
}

function getAll() {
  return client.user.findMany();
}

export const usersRepository = {
  create,
  getAll,
  getByEmail,
  activate,
};
