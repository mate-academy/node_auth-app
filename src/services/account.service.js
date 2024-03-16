'use strict';

const { Account } = require('../models/Account');

const getAllByUser = async(userId) => {
  return Account.findAll({ where: { userId } });
};

const add = async({ userId, id, name, type }) => {
  return Account.create({
    userId, id, name, type,
  });
};

const removeAllByUser = async(userId) => {
  await Account.destroy({ where: { userId } });
};

const removeByType = async({ type, userId }) => {
  await Account.destroy({ where: {
    userId, type,
  } });
};

module.exports = {
  getAllByUser,
  add,
  removeAllByUser,
  removeByType,
};
