import * as v from 'valibot';
import { ApiError } from '../exeptions/api.error.js';

const emailSchema = v.pipe(
  v.string('Your email must be a string.'),
  v.email('The email address has wrong format.'),
  v.nonEmpty('Please enter your email.'),
);

const nameSchema = v.pipe(
  v.string('Your name must be a string.'),
  v.nonEmpty('Please enter your name.'),
  v.minLength(2, 'Your name must have 2 characters or more.'),
);

const passwordSchema = v.pipe(
  v.string('Your password must be a string.'),
  v.nonEmpty('Please enter your password.'),
  v.minLength(8, 'Your password must have 8 characters or more.'),
  v.regex(/[A-Z]/, 'Password must contain at least one uppercase letter.'),
  v.regex(/[0-9]/, 'Password must contain at least one number.'),
  v.regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one special character.',
  ),
);

const validateField = (schema, value) => {
  const result = v.safeParse(schema, value || '');

  if (!result.success) {
    return result.issues.map((i) => i.message);
  }

  return [];
};

export const validatorMiddleware = (fields) => {
  return (req, res, next) => {
    const errors = {};

    for (const key in fields) {
      const fieldErrors = validateField(fields[key], req.body[key]);

      if (fieldErrors.length > 0) {
        errors[key] = fieldErrors;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw ApiError.badRequest('Error in validation', errors);
    }

    next();
  };
};

export const dataValidate = {
  register: validatorMiddleware({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
  login: validatorMiddleware({ email: emailSchema, password: passwordSchema }),
  reset: validatorMiddleware({ email: emailSchema }),
  setPassword: validatorMiddleware({ password: passwordSchema }),
  updatePassword: validatorMiddleware({ newPassword: passwordSchema }),
  updateEmail: validatorMiddleware({ newEmail: emailSchema }),
};
