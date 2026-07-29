const { ApiError } = require('../controllers/expations/api.error');

const erroMidlleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      message: error.message,
      errors: error.errors,
    });
  }

  return res.status(500).json({
    message: 'Server Error',
  });
};

module.exports = { erroMidlleware };
