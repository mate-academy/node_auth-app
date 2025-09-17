export const catchErrors = (action) => {
  return async function (req, res, next) {
    try {
      await action(req, res, next);
    } catch (e) {
      next(e);
    }
  };
};
