'use strict';

const { findUserById } = require('../services/user.service');
const { normalizeUser } = require('../utils/normalizeUser');

async function getProfile(req, res) {
  const { userId } = req.params;

  const user = await findUserById(userId);

  res.json(normalizeUser(user));
}

module.exports = {
  profileController: {
    getProfile,
  },
};
