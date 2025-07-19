'use strict';

const logger = {
  error: (message, error) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error(message, error);
    }
  },

  info: (message) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  },
};

module.exports = logger;
