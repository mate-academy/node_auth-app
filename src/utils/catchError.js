const catchError = (action) => {
  return async (req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      /* eslint-disable no-console */
      console.error(error);

      next(error);
    }
  };
};

export default catchError;
