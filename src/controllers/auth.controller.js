import { userService } from '../services/user.service.js';
import { tokenService } from '../services/token.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError  } from '../exeptions/api.errors.js';
import bcrypt  from 'bcrypt';

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }

  return null;
};

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  return null;
};

const generateToken = async (res, user) => {
  const normalizedUser = userService.normalized(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    HttpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }
  const hashedPass = await bcript.hash(password, 10);
  await userService.register(email, hashedPass, name);

  res.send({ message: 'User registred' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  await userService.activate(activationToken);

  res.send({ message: 'User activated' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordVlid = await bcript.compare(password, user.password);

  if (!isPasswordVlid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateToken(res, user);

  res.redirect('/profile');
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email)

  generateToken(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id)

  res.clearCookie('refreshToken');

  res.redirect('/login');
}

const profile = async (req, res) => {
  const { name, email, password, newPassword, confirmation } = req.body;

  await Schemas.profileUserSchema.validateAsync({
    name,
    email,
    password,
    newPassword,
    confirmation,
  });

  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email)

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

    const isPasswordVlid = await bcrypt.compare(password, user.password);

    if (!isPasswordVlid) {
      throw ApiError.badRequest('Wrong password');
    }

  if (name) {
    user.name = name;
  }

  if (newPassword && confirmation) {
    if (newPassword !== confirmation) {
      return res
        .status(400)
        .send({ message: 'New password and confirmation do not match' });
    }

    const hashedPass = await bcrypt.hash(newPassword, 10);

    user.password = hashedPass;
  }

  if (email) {
    const emailExists = await userService.findByEmail(email);

    if (emailExists) {
      return res.send({ message: 'User with this email already registred' });
    }

    await emailService.sendNewEmail(user.email);

    user.email = email;
  }

  await user.save();

  return res.status(200).send({ name: user.name, email: user.email });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  profile,
};
