import { User } from '../models/user.model.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }
}

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res) => {
  const { email, password, name } = req.body;
  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  // if (errors.email || errors.password || errors.name) {
  //   throw new ApiError.badRequest('Bad request', errors);
  // }

  const hasErrors = Object.values(errors).some(Boolean);

  if (hasErrors) {
    throw new ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);
  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await User.findOne({ where: { activationToken } });

    if (!user) {
      res.sendStatus(404);

      return;
    }

    user.activationToken = null;
    await user.save();

    const normalizedUser = userService.normalize(user);

    return res.json({
      message: 'Account activated successfully',
      normalizedUser,
    });
  } catch (error) {
    console.error('Activation error:', error);

    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function generateTokens (res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    HttpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
    // refreshAccessToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw new ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();

    return;
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();

    return;
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
