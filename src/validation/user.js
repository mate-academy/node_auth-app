import * as yup from 'yup';

const registerSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup.string().min(6).required('Password is required'),
  name: yup.string().trim().min(2).required('Name is required'),
});

const loginSchema = registerSchema.pick(['email', 'password']);

const newNameSchema = registerSchema.pick(['name']);

const newPasswordSchema = yup.object({
  newPassword: registerSchema.fields.password.optional(),
  password: registerSchema.fields.password.when('newPassword', {
    is: (newPassword) => !!newPassword,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.notRequired(),
  }),
  confirmPassword: registerSchema.fields.password.when('newPassword', {
    is: (newPassword) => !!newPassword,
    then: (schema) =>
      schema
        .oneOf(
          [yup.ref('newPassword'), null],
          'New password and confirm password do not match',
        )
        .required(),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const newEmailSchema = yup.object({
  newEmail: registerSchema.fields.email.optional(),
  email: registerSchema.fields.email.when('newEmail', {
    is: (newEmail) => !!newEmail,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.notRequired(),
  }),
  password: registerSchema.fields.password.when('newEmail', {
    is: (newEmail) => !!newEmail,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const userValidation = {
  registerSchema,
  loginSchema,
  newNameSchema,
  newEmailSchema,
  newPasswordSchema,
};
