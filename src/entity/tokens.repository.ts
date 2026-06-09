import { client } from '../utils/db.js';

function create(userId: string, token: string) {
  return client.token.create({
    data: { userId, token },
  });
}

function getByToken(token: string) {
  return client.token.findFirst({
    where: { token },
  });
}

function deleteByUserId(userId: string) {
  return client.token.deleteMany({
    where: { userId },
  });
}

export const tokensRepository = {
  create,
  getByToken,
  deleteByUserId
};
