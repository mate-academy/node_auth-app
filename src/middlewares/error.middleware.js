'use strict';

// eslint-disable-next-line no-unused-vars
function errorMiddleware(error, req, res, next) {
  // eslint-disable-next-line no-console
  console.log(error);

  res.status(500).json({ message: 'Server error' });
}

module.exports = {
  errorMiddleware,
};
