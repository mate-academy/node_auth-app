'use strict';

function catchError(controller) {
  return function handleRequest(req, res, next) {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}

module.exports = {
  catchError,
};
