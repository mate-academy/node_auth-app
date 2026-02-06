import { z } from 'zod';
import { fnames, TNAMES } from './vocab/dbVocab.ts';

const MIN_PWD = 6;
const MIN_STR = 3;

const authorize = z.object({
  [fnames[TNAMES.USR].email]: z
    .string()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Invalid email',
    }),
  [fnames[TNAMES.USR].pwd]: z.string().min(MIN_PWD),
});

const registration = z.object({
  [fnames[TNAMES.USR].name]: z.string().min(MIN_STR),
  [fnames[TNAMES.USR].email]: z
    .string()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Invalid email',
    }),
  [fnames[TNAMES.USR].pwd]: z.string().min(MIN_PWD),
});

const profileUpdate = z
  .object({
    [fnames[TNAMES.USR].pwd]: z.string().min(MIN_PWD),
    [fnames[TNAMES.USR].name]: z.string().min(MIN_STR).optional(),
    [fnames[TNAMES.USR].email]: z
      .string()
      .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'Invalid email',
      })
      .optional(),
    confirmEmail: z.string().optional(),
  })
  .refine((data) => data.name || data.email, {
    message: 'At least one field (name or email) is required',
  })
  .refine((data) => !data.email || data.confirmEmail === data.email, {
    message: "Emails don't match",
    path: ['confirmEmail'],
  });

const passwordUpdate = z
  .object({
    oldPwd: z.string(),
    newPwd: z.string().min(MIN_PWD),
    confirmation: z.string(),
  })
  .refine((data) => data.confirmation === data.newPwd, {
    message: "Passwords don't match",
    path: ['confirmation'],
  });

const requestPwdUpdate = z.object({
  [fnames[TNAMES.USR].email]: z
    .string()
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Invalid email',
    }),
});

const resolvePwdUpdate = z
  .object({
    [fnames[TNAMES.TKN].token]: z.string(),
    newPwd: z.string().min(MIN_PWD),
    confirmation: z.string(),
  })
  .refine((data) => data.confirmation === data.newPwd, {
    message: "Passwords don't match",
    path: ['confirmation'],
  });

const sch = {
  auth: authorize,
  reg: registration,
  upd: profileUpdate,
  pwdUpd: passwordUpdate,
  pwdReq: requestPwdUpdate,
  pwdRes: resolvePwdUpdate,
};

type Schema = (typeof sch)[keyof typeof sch];

export { sch, type Schema };
