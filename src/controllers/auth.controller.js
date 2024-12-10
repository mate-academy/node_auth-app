import {
  usersService,
  emailService,
  jwtService,
  tokenService,
} from './../services/index.js';
import { userSchema } from './../schemas/index.js';
import { ApiError } from '../exeptions/api.error.js';
import { dynamicSchema } from './../utils/dynamicSchema.js';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
  const userInformation = req.body;

  const { error, value } = userSchema.validate(userInformation, {
    allowUnknown: true,
  });

  const hashedPassword = await bcrypt.hash(value.password, 10);

  if (error) {
    throw ApiError.badRequest(error.message, { field: error.message });
  }

  await usersService.register({ ...value, password: hashedPassword });

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await usersService.getOne({ activationToken });

  if (!user) {
    throw ApiError.notFound({ user: 'User not found' });
  }

  await usersService.update({ activationToken }, { activationToken: null });

  res.send({ message: 'OK' });
};

const generateTokens = async (res, user) => {
  const normalizedUser = usersService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersService.getOne({ email });

  if (!user) {
    throw ApiError.unauthorized({ user: 'invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized({ user: 'invalid email or password' });
  }

  if (user.activationToken) {
    throw ApiError.unauthorized({ user: 'profile is not activated' });
  }

  generateTokens(res, user);
};

const getUser = async (req, res) => {
  const { userId } = req;

  const user = await usersService.getOne({ id: userId });

  res.json(usersService.normalize(user));
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.badRequest('email is required', {
      email: 'email is required',
    });
  }

  const user = await usersService.getOne({ email });

  if (!user) {
    throw ApiError.badRequest('This email is not registered', {
      email: 'This email is not registered',
    });
  }

  const resetPasswordToken = jwtService.signConfirmToken(
    usersService.normalize(user),
  );

  await usersService.update({ email }, { resetPasswordToken });

  await emailService.sendResetPasswordEmail(email, resetPasswordToken);

  res.send({ message: 'Check your email for reset password' });
};

const changePassword = async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password, confirmPassword } = req.body;

  const user = jwtService.verify(resetPasswordToken);

  if (!user) {
    await usersService.update(
      { resetPasswordToken },
      {
        resetPasswordToken: null,
      },
    );

    throw ApiError.badRequest('The provided token is no longer valid', {
      token: 'The token has expired or is invalid',
    });
  }

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords are different', {
      password: 'Passwords are different',
    });
  }

  const currentSchema = dynamicSchema(Object.keys({ password }, userSchema));
  const { error, value } = currentSchema.validate({ password });

  if (error) {
    throw ApiError.badRequest(error.message, { password: error.message });
  }

  const hashedPassword = await bcrypt.hash(value, 10);

  await usersService.update(
    { id: user.id },
    {
      resetPasswordToken: null,
      password: hashedPassword,
    },
  );

  res.send('Password is changed');
};

const updateUser = async (req, res) => {
  const { userId } = req;
  const { newPassword, confirmPassword, email, name, password } = req.body;

  const user = await usersService.getOne({ id: userId });

  const updatedFields = {};
  const validateFields = {};

  if (name) {
    updatedFields.name = name;
    validateFields.name = name;
  }

  let isPasswordValid = false;

  if (password) {
    isPasswordValid = await bcrypt.compare(password, user.password);
  }

  if (newPassword || confirmPassword) {
    if (!password || !newPassword || !confirmPassword) {
      throw ApiError.badRequest('All passwords are required', {
        password: 'All passwords are required',
      });
    }

    if (newPassword !== confirmPassword || !isPasswordValid) {
      throw ApiError.badRequest('Passwords are different', {
        password: 'Passwords are different',
      });
    }

    updatedFields.password = await bcrypt.hash(newPassword, 10);
    validateFields.password = newPassword;
  }

  if (email) {
    if (!password || !isPasswordValid) {
      throw ApiError.badRequest('Password is invalid', {
        password: 'Password is invalid',
      });
    }

    const existingUser = await usersService.getOne({ email });

    if (existingUser) {
      throw ApiError.badRequest('Email is already in use', {
        email: 'Email is already in use',
      });
    }

    const changeEmailToken = jwtService.signConfirmToken({
      userId,
      email,
    });

    updatedFields.changeEmailToken = changeEmailToken;
    validateFields.email = email;
  }

  const currentSchema = dynamicSchema(Object.keys(validateFields), userSchema);

  const { error } = currentSchema.validate(validateFields);

  if (error) {
    throw ApiError.badRequest(error.message, { field: error.message });
  }

  const updatedUser = await usersService.update({ id: userId }, updatedFields);

  if (email) {
    await emailService.sendConfirmationEmail(
      email,
      updatedFields.changeEmailToken,
    );
  }

  res.send(usersService.normalize(updatedUser));
};

const changeEmail = async (req, res) => {
  const { changeEmailToken } = req.params;

  const data = jwtService.verify(changeEmailToken);

  if (!data) {
    throw ApiError.notFound();
  }

  const user = await usersService.getOne({ id: data.userId });

  if (!user) {
    throw ApiError.notFound();
  }

  if (Date.now() > data.exp * 1000) {
    await usersService.update(
      { id: data.userId },
      {
        changeEmailToken: null,
      },
    );
    throw ApiError.badRequest('The provided token is no longer valid', {
      token: 'The token has expired or is invalid',
    });
  }

  await usersService.update(
    { id: data.userId },
    {
      changeEmailToken: null,
      email: data.email,
    },
  );

  await emailService.sendNotificationChangeEmail(user.email);

  res.send('Email is changed');
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = refreshToken ? await tokenService.getByToken(refreshToken) : '';

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  getUser,
  resetPassword,
  changePassword,
  updateUser,
  changeEmail,
  refresh,
  logout,
};
