import { ApiError } from '../utils/api.error.js';

export const validate = (schemas) => {
  return async (req, res, next) => {
    const errors = {};

    for (const [source, schema] of Object.entries(schemas)) {
      try {
        req[source] = await schema.parseAsync(req[source]);
      } catch (error) {
        if (error.name !== 'ZodError') {
          return next(error);
        }

        Object.assign(errors, error.flatten().fieldErrors);
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(ApiError.badRequest('Validation error', errors));
    }

    return next();
  };
};
