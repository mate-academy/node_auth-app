import { RefreshToken } from '../../models/RefreshToken.model.js';

function create(userId: number, token: string) {
  return RefreshToken.create({ userId, token });
}

function getByToken(token: string) {
  return RefreshToken.findOne({
    where: {
      token,
    },
  });
}

function deleteByUserId(userId: number) {
  return RefreshToken.destroy({
    where: {
      userId,
    },
  });
}

export const refreshTokenRepository = {
  create,
  deleteByUserId,
  getByToken,
};
