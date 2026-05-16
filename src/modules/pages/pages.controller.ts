import type { RequestHandler } from 'express';
import { authService } from '../auth/auth.service.js';
import { profileService } from '../profile/profile.service.js';
import { AppError } from '../../errors/AppError.js';
import { generateAccessToken } from '../../utils/jwt.js';

type TokenParams = {
  token: string;
};

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
};

const layout = (title: string, body: string) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
    </head>
    <body>
      <h1>${title}</h1>
      ${body}
    </body>
  </html>
`;

const showRegister: RequestHandler = (_req, res) => {
  res.send(
    layout(
      'Register',
      `
        <form method="POST" action="/register">
          <input name="name" placeholder="Name" />
          <input name="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Register</button>
        </form>
        <p>Password must be at least 8 characters and contain uppercase, lowercase, digit and special character.</p>
        <a href="/login">Login</a>
      `,
    ),
  );
};

const register: RequestHandler = async (req, res) => {
  await authService.register(req.body);

  res.redirect('/email-sent');
};

const showLogin: RequestHandler = (_req, res) => {
  res.send(
    layout(
      'Login',
      `
        <form method="POST" action="/login">
          <input name="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
        <a href="/forgot-password">Forgot password?</a>
      `,
    ),
  );
};

const login: RequestHandler = async (req, res) => {
  const { accessToken } = await authService.login(req.body);

  res.cookie('accessToken', accessToken, cookieOptions);
  res.redirect('/profile');
};

const activate: RequestHandler<TokenParams> = async (req, res) => {
  const user = await authService.activate(req.params.token);
  const accessToken = generateAccessToken(user);

  res.cookie('accessToken', accessToken, cookieOptions);
  res.redirect('/profile');
};

const logout: RequestHandler = (_req, res) => {
  res.clearCookie('accessToken');
  res.redirect('/login');
};

const showForgotPassword: RequestHandler = (_req, res) => {
  res.send(
    layout(
      'Forgot password',
      `
        <form method="POST" action="/forgot-password">
          <input name="email" placeholder="Email" />
          <button type="submit">Send reset email</button>
        </form>
      `,
    ),
  );
};

const forgotPassword: RequestHandler = async (req, res) => {
  await authService.forgotPassword(req.body);

  res.redirect('/email-sent');
};

const showEmailSent: RequestHandler = (_req, res) => {
  res.send(
    layout(
      'Email sent',
      `
        <p>If this email exists, instructions were sent.</p>
        <a href="/login">Back to login</a>
      `,
    ),
  );
};

const showResetPassword: RequestHandler<TokenParams> = (req, res) => {
  const { token } = req.params;

  res.send(
    layout(
      'Reset password',
      `
        <form method="POST" action="/reset-password/${token}">
          <input name="password" type="password" placeholder="New password" />
          <input name="confirmation" type="password" placeholder="Confirm password" />
          <button type="submit">Reset password</button>
        </form>
      `,
    ),
  );
};

const resetPassword: RequestHandler<TokenParams> = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body);

  res.redirect('/reset-password-success');
};

const showResetPasswordSuccess: RequestHandler = (_req, res) => {
  res.send(
    layout(
      'Password reset successful',
      `
        <p>Your password was reset successfully.</p>
        <a href="/login">Go to login</a>
      `,
    ),
  );
};

const showProfile: RequestHandler = async (req, res) => {
  const currentUser = req.user;

  if (!currentUser) {
    throw new AppError(401, 'Unauthorized');
  }

  const user = await profileService.getProfile(currentUser.id);

  res.send(
    layout(
      'Profile',
      `
        <p>Name: ${user.name}</p>
        <p>Email: ${user.email}</p>

        <form method="POST" action="/logout">
          <button type="submit">Logout</button>
        </form>

        <h2>Change name</h2>
        <form method="POST" action="/profile/name">
          <input name="name" placeholder="New name" />
          <button type="submit">Change name</button>
        </form>

        <h2>Change password</h2>
        <form method="POST" action="/profile/password">
          <input name="oldPassword" type="password" placeholder="Old password" />
          <input name="newPassword" type="password" placeholder="New password" />
          <input name="confirmation" type="password" placeholder="Confirm new password" />
          <button type="submit">Change password</button>
        </form>

        <h2>Change email</h2>
        <form method="POST" action="/profile/email">
          <input name="newEmail" placeholder="New email" />
          <input name="password" type="password" placeholder="Current password" />
          <button type="submit">Change email</button>
        </form>
      `,
    ),
  );
};

const updateName: RequestHandler = async (req, res) => {
  const currentUser = req.user;

  if (!currentUser) {
    throw new AppError(401, 'Unauthorized');
  }

  await profileService.updateName(currentUser.id, req.body.name);

  res.redirect('/profile');
};

const changePassword: RequestHandler = async (req, res) => {
  const currentUser = req.user;

  if (!currentUser) {
    throw new AppError(401, 'Unauthorized');
  }

  await profileService.changePassword(currentUser.id, req.body);

  res.redirect('/profile');
};

const changeEmail: RequestHandler = async (req, res) => {
  const currentUser = req.user;

  if (!currentUser) {
    throw new AppError(401, 'Unauthorized');
  }

  await profileService.changeEmail(currentUser.id, req.body);

  res.redirect('/email-sent');
};

const confirmEmailChange: RequestHandler<TokenParams> = async (req, res) => {
  const user = await profileService.confirmEmailChange(req.params.token);
  const accessToken = generateAccessToken(user);

  res.cookie('accessToken', accessToken, cookieOptions);
  res.redirect('/profile');
};

export const pagesController = {
  showRegister,
  register,
  showLogin,
  login,
  activate,
  logout,
  showForgotPassword,
  forgotPassword,
  showEmailSent,
  showResetPassword,
  resetPassword,
  showResetPasswordSuccess,
  showProfile,
  updateName,
  changePassword,
  changeEmail,
  confirmEmailChange,
};
