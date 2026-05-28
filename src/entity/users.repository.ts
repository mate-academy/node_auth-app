import { client } from '../utils/db';

function create(email: string, password: string) {
  return client.user.create({
    data: { email, password },
  });
}

function getAll() {
  return client.user.findMany();
}

export const usersRepository = {
  create,
  getAll,
};
