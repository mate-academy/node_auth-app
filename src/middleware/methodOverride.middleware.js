'use strict';

module.exports = function methodOverride() {
  return (req, _res, next) => {
    if (req.method === 'POST' && req.query && req.query._method) {
      req.method = String(req.query._method).toUpperCase();
    }
    next();
  };
};
