const catchError = (actionFn) => {
  return async (req, res, next) => {
    try {
      await actionFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { catchError };
