import { Token } from '../models/Token';

const create = (userId: number, refreshToken: string) => {
  return Token.create({
    userId,
    refreshToken,
  });
};

const getByToken = (refreshToken: string) => {
  return Token.findOne({
    where: {
      refreshToken,
    },
  });
};

const deleteByUserId = (userId: number) => {
  return Token.destroy({
    where: {
      userId,
    },
  });
};

export const tokensService = {
  create,
  getByToken,
  deleteByUserId,
};
