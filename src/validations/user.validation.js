import z from 'zod';

const userModel = {
  minNameLength: 4,
  maxNameLength: 30,
  passwordRegex:
    // eslint-disable-next-line max-len, no-useless-escape
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:"<>?.,;'\[\]\\/-]).{6,}$/,
  minPasswordLength: 6,
  passwordRegexMessage:
    // eslint-disable-next-line max-len
    'Password must contain at least one lowercase letter, one uppercaseletter, and one special character',
};

const code = 'superRefine';

const create = (_) =>
  z
    .object({
      name: z
        .string()
        .min(
          userModel.minNameLength,
          `Name must be at least ${userModel.minNameLength} characters long`,
        )
        .max(
          userModel.maxNameLength,
          `Name must be at most ${userModel.maxNameLength} characters long`,
        ),
      email: z.string().email('Invalid email format').trim(),
      password: z
        .string()
        .min(
          userModel.minPasswordLength,
          `Password must be at least ${userModel.minPasswordLength} characters long`,
        )
        .regex(userModel.passwordRegex, userModel.passwordRegexMessage)
        .trim(),
    })
    .required();

const updateInfo = (req) =>
  z
    .object({
      name: z
        .string()
        .min(
          userModel.minNameLength,
          `Name must be at least ${userModel.minNameLength} characters long`,
        )
        .max(
          userModel.maxNameLength,
          `Name must be at most ${userModel.maxNameLength} characters long`,
        )
        .optional(),
      email: z.string().email('Invalid email format').trim().optional(),
    })
    .superRefine((data, ctx) => {
      const { name, email } = data;
      const { user } = req;
      const { addIssue } = ctx;

      if (name === user.name) {
        addIssue({
          path: ['name'],
          code,
          message: `Name is equal the current name ${user.name}`,
        });
      }

      if (email === user.email) {
        addIssue({
          path: ['email'],
          code,
          message: `Email is equal the current name ${user.email}`,
        });
      }
    });

const updatePassword = (_) =>
  z
    .object({
      oldPassword: z
        .string()
        .min(
          userModel.minPasswordLength,
          `Password must be at least ${userModel.minPasswordLength} characters long`,
        )
        .regex(userModel.passwordRegex, userModel.passwordRegexMessage)
        .trim(),

      newPassword: z
        .string()
        .min(
          userModel.minPasswordLength,
          `Password must be at least ${userModel.minPasswordLength} characters long`,
        )
        .regex(userModel.passwordRegex, userModel.passwordRegexMessage)
        .trim(),

      confirmNewPassword: z
        .string()
        .min(
          userModel.minPasswordLength,
          `Password must be at least ${userModel.minPasswordLength} characters long`,
        )
        .regex(userModel.passwordRegex, userModel.passwordRegexMessage)
        .trim(),
    })
    .superRefine((data, ctx) => {
      const { oldPassword, newPassword, confirmNewPassword } = data;
      const { addIssue } = ctx;

      if (newPassword !== confirmNewPassword) {
        addIssue({
          path: ['confirmNewPassword'],
          code,
          message: 'New password and confirmation do not match',
        });
      }

      if (newPassword === oldPassword) {
        ctx.addIssue({
          path: ['newPassword'],
          code,
          message: 'New password must be different from the old password',
        });
      }
    });

const userSchema = {
  create,
  updateInfo,
  updatePassword,
};

export default userSchema;
