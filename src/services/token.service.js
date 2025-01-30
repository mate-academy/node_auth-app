import { Token } from '../models/token.model.js';
import { ApiError } from '../exceptions/api.error.js';

const save = async (userId, newToken) => {
  // console.log('Inside tokenService/save');
  const token = await Token.findOne({
    where: {
      userId,
    },
  });

  if (!token) {
    // console.log('Couldnt find token in DB, creating new one');
    return Token.create({
      userId,
      refreshToken: newToken,
    });
  }

  // console.log('Found token in DB, updating to a new value');
  token.refreshToken = newToken;
  await token.save();
};

const getByToken = async (refreshToken) => {
  return Token.findOne({
    where: {
      refreshToken,
    },
  });
};

const getByUserId = async (userId) => {
  return Token.findOne({
    where: {
      userId,
    },
  });
};

const removeByUserId = async (userId) => {
  // console.log('Inside tokenService/remove');

  const token = await getByUserId(userId);

  if (!token) {
    // console.log('Couldnt find a token linked to a such user');
    throw ApiError.notFound();
  }

  // console.log('Found token, removing from DB');

  await token.destroy();
  // console.log('Token deleted, logging out');
};

export const tokenService = {
  save,
  getByToken,
  getByUserId,
  removeByUserId,
};
