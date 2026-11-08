'use strict';

function getProfile(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  userController: { getProfile },
};
