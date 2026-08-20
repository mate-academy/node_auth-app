import { AppError } from '../core/AppError.js';

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errorMessage = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    return next(
      new AppError(
        `Validation error: ${errorMessage}`,
        400,
        result.error.format(),
      ),
    );
  }

  if (result.data.params) {
    Object.assign(req.params, result.data.params);
  }

  if (result.data.query) {
    req.query = result.data.query;
  }

  if (result.data.body) {
    req.body = result.data.body;
  }

  next();
};

export default validate;
