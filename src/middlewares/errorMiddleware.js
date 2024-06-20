const { response } = require('../constants/response');

function errorMiddleware(err, req, res, next) {
  if (err) {
    res
      .status(response[503].statusCode)
      .json({ message: response[503].messages.serverError });
  }

  next();
}

module.exports = { errorMiddleware };
