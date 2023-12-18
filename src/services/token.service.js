'use strict';

const { v4: uuidv4 } = require('uuid');

const generateActivationToken = () => {
  return uuidv4();
};

exports.tokenService = {
  generateActivationToken,
};
