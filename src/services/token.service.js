'use strict';

const { Token } = require('../models/Token');
const bcrypt = require('bcrypt');
const { ApiError } = require('../exceptions/ApiError');

require('dotenv').config();

const getByUserId = (userId) => {
  return Token.findOne({
    where: { userId },
  });
};

const get = async({ userId, type }) => {
  const userToken = await getByUserId(userId);

  if (!userToken) {
    throw ApiError.NotFound('User not found');
  }

  return userToken[type];
};

const save = async({ userId, token, type }) => {
  const userToken = await getByUserId(userId);

  const hashedToken = await bcrypt.hash(
    token, Number(process.env.BCRYPT_SALT)
  );

  if (!userToken) {
    await Token.create({
      userId, [type]: hashedToken,
    });

    return;
  }

  userToken[type] = hashedToken;
  await userToken.save();
};

const remove = async({ userId, type }) => {
  const userToken = await getByUserId(userId);

  if (!userToken) {
    throw ApiError.NotFound('User not found');
  }

  userToken[type] = null;
  await userToken.save();
};

const removeAll = async({ userId }) => {
  const userToken = await getByUserId(userId);

  if (!userToken) {
    throw ApiError.NotFound('User not found');
  }

  await Token.destroy({
    where: { userId },
  });
};

module.exports = {
  getByUserId,
  get,
  save,
  remove,
  removeAll,
};
