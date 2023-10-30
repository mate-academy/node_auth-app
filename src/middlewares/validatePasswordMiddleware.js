'use strict';

const validator = require('validator');

const validatePasswordMiddleware = (req, res, next) => {
  const { newPassword, confirmation } = req.body;

  if (!validator.isLength(newPassword, { min: 6 })
  || newPassword !== confirmation) {
    res.status(400).send({
      error: 'Invalid password or confirmation does not match',
    });

    return;
  }

  req.validatedNewPassword = newPassword;
  next();
};

module.exports = {
  validatePasswordMiddleware,
};
