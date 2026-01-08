'use strict';

const { User } = require('./User');

// eslint-disable-next-line no-console
console.log('DEBUG: User model is:', User);

module.exports = {
  models: {
    User,
  },
};
