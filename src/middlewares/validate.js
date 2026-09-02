import { ApiError } from '../utils/ApiError.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        result.error.issues[0].message,
      );
    }

    req.body = result.data;
    next();
  };
}
