import yup from 'yup';

export const createUserSchema = yup.object({
  name: yup.string().required().typeError('Name is required').strict(),
  email: yup
    .string()
    .email()
    .required()
    .typeError('Email is required')
    .strict(),
  password: yup
    .mixed()
    .test((value) => {
      return typeof value === 'string' || typeof value === 'number';
    })
    .required()
    .typeError('Password is required')
    .strict(),
});
