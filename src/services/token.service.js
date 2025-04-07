import { Token } from '../models/token.js';

async function save(userId, tokenValue, tokenType) {
  const token = await Token.findOne({
    where: { userId },
  });

  if (token) {
    token[tokenType] = tokenValue;

    await token.save();

    return;
  }

  await Token.create({ userId, [tokenType]: tokenValue });
}

function getByToken(tokenValue, tokenType) {
  return Token.findOne({
    where: { [tokenType]: tokenValue },
  });
}

function remove(userId, tokenType) {
  return Token.destroy({
    where: { userId, type: tokenType },
  });
}

export const tokenService = {
  getByToken,
  save,
  remove,
};
