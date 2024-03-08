'use strict';

const { ErrorApi } = require('../exceptions/ErrorApi.js');

function checkActTokenMW(req, res, next) {
  const { activetionToken } = req.params;

  if (!activetionToken) {
    throw ErrorApi.BadRequest('ActivetionToken is not transmitted');
  }

  if (activetionToken.length !== 36) {
    throw ErrorApi.BadRequest('Incorrect activetionToken');
  }

  next();
}

module.exports = { checkActTokenMW };
