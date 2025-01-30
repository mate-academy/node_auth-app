export const catchError = (action) => {
  return async function (req, res, next) {
    try {
      await action(req, res, next);
    } catch (error) {
      // console.log('CatchError util got something');
      next(error);
    }
  };
};
