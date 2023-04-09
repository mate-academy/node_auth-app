'use strict';

const { User } = require('../models/user');

const register = async(req, res, next) => {
  const { email, password } = req.body;
  const user = await User.create({
    email, password,
  });

  res.send(user);
};

module.exports = {
  register,
};
