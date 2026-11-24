export const catchError = (action) => {
  return async function (req, res, next) {
    try {
      await action(req, res, next);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      next(error);
    }
  };
};
