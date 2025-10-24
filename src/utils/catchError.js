export const catchError = (action) => {
  return (req, res, next) => {
    action(req, res, next).catch(next);
  };
};
