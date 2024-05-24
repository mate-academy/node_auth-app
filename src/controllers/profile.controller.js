'use strict';

const { ApiError } = require('../exeptions/api.error');
const { User } = require('../models/user.model');
const { normalizeUser } = require('../utils/normalizeUser');

async function getProfile(req, res) {
  const { userId } = req.params;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest({ message: 'User not found' });
  }

  res.json(normalizeUser(user));
}

module.exports = {
  profileController: {
    getProfile,
  },
};
