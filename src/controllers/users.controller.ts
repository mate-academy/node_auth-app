import type { Request, Response } from 'express';
import * as userRepository from '../repository/users.repository.ts';
import * as mailer from '../service/mailer.service.ts';
import * as jws from '../service/jws.service.ts';
import { type LoginData, type NormalizedUser, type RawUser, type UserPropsToUpdate } from '../types/index.ts';
import { ApiError } from '../types/index.ts';
import type { User } from '../../generated/prisma/client.ts';
import * as tokenRepository from '../repository/tokens.repository.ts';
import { v4 as uuidv4 } from 'uuid';
import { validateEmail, validatePassword } from '../utils/validators.ts';
import * as bcrypt from 'bcrypt';
import auth from '../service/auth.service.ts';

const create = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RawUser;
  let user: User | null = await userRepository.getByEmail(email);

  const emailValidation = validateEmail(email) || null;
  const passValidation = validatePassword(password) || null;

  const errors = [emailValidation, passValidation].filter(
    validation => validation !== null
  ).map(err => ({ message: err}));

  if (errors.length) {
    throw ApiError.badRequest(errors);
  }

  if (user?.activationToken) {
    throw ApiError.badRequest([{
      message: 'User already registered, check your mailbox for activation email'
    }]);
  }

  if (user) {
    throw ApiError.badRequest([{
      message: 'User has already been registered'
    }]);
  }

  if (name && !validateEmail(email) && !validatePassword(password) && !user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
    } as RawUser);
  }

  if (!user) {
    throw ApiError.badRequest([{
        message: 'Invalid sign-up data'
      }]
    )
  }

  const href = `${process.env.CLIENT_URL}/activate/${email}/${user?.activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href=${href}> Click to activate </a>
  `;

  await mailer.sendMail(email, html);

  res.statusCode = 200;
  res.send(userRepository.normalize(user));
};

const activate = async (req: Request, res: Response) => {
  const { email, activationToken } = req.params;

  if (typeof email !== 'string' || typeof activationToken !== 'string') {
    throw ApiError.badRequest([{
        message: 'Invalid data'
      }]
    );
  }

  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest(
      [{message: 'User not found'}]
    );
  }

  if (!user.activationToken) {
    throw ApiError.accountAlreadyExist([{
      message: 'Account already activated'
    }]);
  }

  if (user.activationToken !== activationToken) {
    throw ApiError.badRequest([{
      message: 'Invalid activation token'
    }]);
  }

  const normalizedUser = userRepository.normalize(user);

  await auth.saveAuthorization(res, normalizedUser);
  await userRepository.deleteActivationToken(user.id);

  res.statusCode = 200;
  res.send({
    user: normalizedUser,
    accessToken: jws.generateAccessToken(normalizedUser),
  });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw ApiError.badRequest([{
      message: 'Invalid login data'
    }])
  }

  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.notFound([{
      message: 'User not found'
    }])
  }

  if (user.activationToken) {
    throw ApiError.authError([{
      message: 'User isnt activated, check your mailbox for activation link'
    }]);
  }

  const compare = await bcrypt.compare(password, user?.password);

  if (!compare) {
    throw ApiError.authError([{
      message: 'Invalid password',
    }])
  }

  const normalizedUser = userRepository.normalize(user);

  await auth.saveAuthorization(res, normalizedUser);

  res.statusCode = 200;
  res.send({
    user: normalizedUser,
    accessToken: jws.generateAccessToken(normalizedUser),
  });
};

const profile = async (req: Request, res: Response) => {
  const normalizedUser = req.normalizedUser;

  res.statusCode = 200;
  res.send(normalizedUser);
};

const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies['refreshToken'];

  res.clearCookie('refreshToken');

  const deleted = await tokenRepository.deleteToken(refreshToken);

  if (!deleted) {
    throw ApiError.notFound([{
      message: 'Account not found'
    }]);
  }

  res.statusCode = 204;
}

const changeName = async (req: Request, res: Response) => {
  const { name }: { name: string } = req.body;
  const userToUpdate = req.normalizedUser as NormalizedUser || null;

  if (typeof name !== 'string' || name.length < 2) {
    throw ApiError.badRequest([{
      message: 'Invalid data for an update'
    }])
  }

  const updatedUser = await userRepository.change(userToUpdate?.id, { name });
  const normalizedUser = userRepository.normalize(updatedUser);

  await auth.saveAuthorization(res, normalizedUser)

  res.statusCode = 200;
  res.send({
    user: normalizedUser,
    accessToken: jws.generateAccessToken(normalizedUser)
  });
}

const changeSensetive = async (req: Request, res: Response) => {
  const loginData: LoginData | null = req.body.loginData || null;
  const toChange: UserPropsToUpdate | null = req.body.toChange || null;

  if (!loginData || !toChange) {
    throw ApiError.badRequest([{
      message: 'Bad request'
    }]);
  }

  const user = await userRepository.getById(req.normalizedUser?.id) || null;

  if (toChange?.email && await userRepository.getByEmail(toChange?.email)) {
    throw ApiError.badRequest([{
      for: 'email',
      message: 'Email already registered',
    }])
  }

  if (!user) {
    throw ApiError.notFound([{
      for: 'email',
      message: 'Account not found'
    }])
  }

  const compare = await bcrypt.compare(loginData.password, user.password)

  if (!compare) {
    throw ApiError.authError([{
      for: 'currentPassword',
      message: 'Invalid Password'
    }])
  }

  const updatedToChange = { ...toChange }

  if (Object.keys(updatedToChange).includes('password')) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(updatedToChange.password, salt);
    updatedToChange.password = hashedPassword
  }

  const updatedUser = await userRepository.change(user.id, updatedToChange);

  if (!updatedUser) {
    throw new ApiError(
      'User not found',
      404,
      { errors: [{ message: 'User not found'}]}
    );
  };

  if (toChange?.email) {
      const html = `
        <h1>Changes in your auth account</h1>
        <h3>Email changed to ${toChange?.email}</h3>
      `;

      mailer.sendMail(user.email, html, 'Update');
  }

  const normalizedUser = userRepository.normalize(updatedUser);

  await auth.saveAuthorization(res, normalizedUser)

  res.statusCode = 200;
  res.send({
    user: normalizedUser,
    accessToken: jws.generateAccessToken(normalizedUser)
  })
}

const generatePasswordToken = async (req: Request, res: Response) => {
  const { email } = req.body;


  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.notFound([{
      for: 'email',
      message: 'User not found'
    }])
  }

  const passwordToken = uuidv4();

  const updatedUser = await userRepository.updatePasswordToken(user.id, passwordToken);

  if (!updatedUser) {
    throw new Error('Internal Server Error');
  }

  const href = `${process.env.CLIENT_URL}/changePassword/${email}/${passwordToken}`
  const html = `
    <h1>Password reset</h1>
    <a href=${href}>Click to update your password</a>
  `

  mailer.sendMail(email, html, 'Password reset');

  res.sendStatus(204);
}

const changePassword = async (req: Request, res: Response) => {
  const { email, passwordToken, password } = req.body;

  if (!email || !passwordToken || !password ) {
    throw ApiError.badRequest([{ message: 'Bad request'}]);
  }

  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.notFound([{ message: 'User not found '}])
  }

  if (user?.passwordToken !== passwordToken) {
    throw ApiError.badRequest([{  for: 'general', message: 'Invalid or expired link'}]);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await userRepository.change(user?.id, { password: hashedPassword, passwordToken: null})

  res.sendStatus(204);
}

export { create, activate, login, profile, logout, changeName, changeSensetive, generatePasswordToken, changePassword };
