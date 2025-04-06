import { Token } from '../models/token.js';

async function save(userId, newToken) {
  const currentToken = await Token.findOne({ where: { UserId: userId } });

  if (!currentToken) {
    await Token.create({ refreshToken: newToken, UserId: userId });

    return;
  }

  currentToken.refreshToken = newToken;
  await currentToken.save();
}

async function getRefreshToken(userId) {
  const foundToken = await Token.findOne({ where: { UserId: userId } });

  if (!foundToken) {
    return undefined;
  } else {
    return foundToken;
  }
}

async function deleteToken(id) {
  try {
    console.log(`DELETING TOKEN | ID IS => ${id}`);
    await Token.destroy({ where: { id } });

    return true;
  } catch (err) {
    console.error(`catch error deleteToken: ${err.message}`);

    return false;
  }
}

async function getTokens(req) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined;

  const refreshToken = req.cookies?.refreshToken;

  return { accessToken, refreshToken };
}

export const tokenRepository = {
  save,
  getTokens,
  getRefreshToken,
  deleteToken,
};
