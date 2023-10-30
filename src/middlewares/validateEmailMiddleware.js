'use strict';

const validator = require('validator');

const validateEmailMiddleware = (req, res, next) => {
  const { newEmail, confirmation } = req.body;

  if (!validator.isEmail(newEmail) || newEmail !== confirmation) {
    res.status(400).send({
      error: 'Email is invalid or confirmation does not match',
    });

    return;
  }

  req.validatedNewEmail = newEmail;
  next();
};

module.exports = {
  validateEmailMiddleware,
};
