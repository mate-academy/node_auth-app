'use strict';

const validator = require('validator');

const validateNameMiddleware = (req, res, next) => {
  const { name } = req.body;

  if (!validator.isLength(name, {
    min: 2, max: 20,
  })) {
    res.status(400).send({ error: 'Invalid name' });

    return;
  }

  req.validatedName = name;
  next();
};

module.exports = {
  validateNameMiddleware,
};
