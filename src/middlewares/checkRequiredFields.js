import { ApiError } from '../exeptions/api.error.js';

export function checkRequiredFields(fields) {
  return function (req, res, next) {
    const extractedValues = fields.reduce(
      (result, field) => ({
        ...result,
        [field]: req.body[field],
      }),
      {},
    );

    if (Object.values(extractedValues).every((value) => value !== undefined)) {
      next();
    } else {
      const missingFields = Object.keys(extractedValues).filter(
        (key) => extractedValues[key] === undefined,
      );
      const errorMessage = `Required field(s) missing: ${missingFields.join(', ')}`;
      const error = ApiError.badRequest(errorMessage, { missingFields });

      next(error);
    }
  };
}
