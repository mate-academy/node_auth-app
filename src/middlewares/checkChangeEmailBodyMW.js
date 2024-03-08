'use strict';

const { ErrorApi } = require('../exceptions/ErrorApi.js');

function checkChangeEmailBodyMW(req, res, next) {
  const { activetionToken, newEmail } = req.body;

  if (!activetionToken) {
    throw ErrorApi.BadRequest('ActivetionToken is not transmitted');
  }

  if (activetionToken.length !== 36) {
    throw ErrorApi.BadRequest('Incorrect activetionToken');
  }

  if (!newEmail) {
    throw ErrorApi.BadRequest('Email is not transmitted');
  }

  next();
}

module.exports = { checkChangeEmailBodyMW };
