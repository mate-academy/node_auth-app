'use strict';

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  res.status(500).json({ message: 'Internal server error' });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
