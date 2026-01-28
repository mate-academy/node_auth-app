export function validate(validator, source = 'body') {
  return (req, res, next) => {
    try {
      const data = validator(req[source]);

      req[source] = data;
      next();
    } catch (err) {
      next(err);
    }
  };
}
