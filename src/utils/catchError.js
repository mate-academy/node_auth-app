'use strict';

function catchError(fn) {
  return async function(req, res, next) {
    try {
      await fn(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

module.exports = {
  catchError,
};
