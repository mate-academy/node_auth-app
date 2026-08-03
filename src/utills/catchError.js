const catchError = (action) => {
  return async function (request, response, next) {
    try {
      await action(request, response, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  catchError,
};
