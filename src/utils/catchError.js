'use strict';

const catchError = (action) => {
  return async(req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  };
};

module.exports = {
  catchError,
};
