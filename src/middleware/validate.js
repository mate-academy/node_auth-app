'use strict';

const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });

    return;
  }

  next();
}

module.exports = validate;
