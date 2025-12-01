import { Op } from 'sequelize';
import { Token } from '../models/token.js';
import { User } from '../models/user.js';

const activeTokenWhere = (token, type) => ({
  where: { token, type, used: false },
});

function createToken({ userId, type, token, expiresIn }) {
  return Token.create({
    userId,
    type,
    token,
    expireAt: new Date(Date.now() + expiresIn),
  });
}

function findByToken(token, type) {
  return Token.findOne(activeTokenWhere(token, type));
}

function findTokenWithUser(token, type) {
  return Token.findOne({
    ...activeTokenWhere(token, type),
    include: User,
  });
}

async function hasActiveToken(userId, type) {
  const token = await Token.findOne({
    where: { userId, type, used: false },
  });

  return !!token;
}

function markAsUsed(tokenId) {
  return Token.update({ used: true }, { where: { id: tokenId } });
}

function invalidateTokensByType(userId, type) {
  return Token.update(
    { used: true },
    {
      where: {
        userId,
        type,
        used: false,
      },
    },
  );
}

function deleteAllUserTokens(userId) {
  return Token.destroy({ where: { userId } });
}

function cleanupExpiredTokens() {
  return Token.destroy({
    where: {
      expireAt: { [Op.lt]: new Date() },
    },
  });
}

export const tokenService = {
  createToken,
  findByToken,
  findTokenWithUser,
  hasActiveToken,
  markAsUsed,
  invalidateTokensByType,
  deleteAllUserTokens,
  cleanupExpiredTokens,
};
