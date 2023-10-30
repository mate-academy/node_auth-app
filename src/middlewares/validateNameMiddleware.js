'use strict';

const validator = require('validator');
const userService = require('../services/user.service');

const validateNameMiddleware = async(req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  const user = await userService.getUserById(id);

  if (!validator.isLength(name, {
    min: 2, max: 20,
  })) {
    res.status(400).send({ error: 'Invalid name' });

    return;
  }

  if (name === user.name) {
    res.status(400).send({ error: 'Name is the same as the current name' });

    return;
  }

  next();
};

module.exports = {
  validateNameMiddleware,
};
