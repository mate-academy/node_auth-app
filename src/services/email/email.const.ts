import { ep } from '../../static/index.ts';

const mailTemplate = {
  act: 'activation',
  res: 'pwd reset',
  emlChg: 'email change',
} as const;

const activate = (token: string) => {
  const link = `${process.env.BASE_URL}${ep.act}?token=${token}`;

  return {
    subject: 'Account activation',
    html: `
      <h1>Hello!</h1>
      <p>Click the link below to activate your account:</p>
      <a href="${link}">${link}</a>
    `,
  };
};

const reset = (token: string) => {
  const link = `${process.env.BASE_URL}${ep.pwrc}?token=${token}`;

  return {
    subject: 'Password reset',
    html: `
      <h1>Hello!</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
    `,
  };
};

const emailChange = (newEmail: string) => {
  return {
    subject: 'Email address changed',
    html: `
      <h1>Hello!</h1>
      <p>Your email address has been changed to: <strong>${newEmail}</strong></p>
      <p>If you did not make this change, please contact support immediately.</p>
    `,
  };
};

const getTemplate = {
  [mailTemplate.act]: activate,
  [mailTemplate.res]: reset,
  [mailTemplate.emlChg]: emailChange,
};

export { mailTemplate, getTemplate };
