import bcrypt from 'bcrypt';

import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwtService.js';
import { tokenService } from '../services/tokenService.js';
import { userService } from '../services/userService.js';

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

async function register(req, res, next) {
  const { name, email, password } = req.body;

  const errors = {
    name: !name ? 'Name is required' : undefined,
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.register({ name,  email, password });

  res.send({ message: 'OK' });
}

async function activate(req, res, next) {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
}

async function login(req, res, next) {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await sendAuthentication(res, user);
}

async function refresh(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized()
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized()
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
}

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
};

async function passwordResetRequest(req, res) {
  const {email} = req.body;

  if (!email) {
    throw ApiError.BadRequest("Email is required")
  };

  
  await userService.resetPassword({email});
 res.send({message: "OK"})

};

async function passwordResetConfirm(req, res) {
  
  const {resetToken} = req.params;
  const { newPassword, confirmPassword} = req.body;

  if (!newPassword || !confirmPassword) {
    throw ApiError.BadRequest('All fields are required')
  };

  if (newPassword !== confirmPassword) {
    throw ApiError.BadRequest('Passwords do not match')
  };

  if (newPassword.length < 6) {
    throw ApiError.BadRequest('Password must be at least 6 characters')
  };



  const user = await User.findOne({where: {resetPasswordToken: resetToken}});
  if (!user) {
    res.sendStatus(404);
    return
  };

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;
  user.resetPasswordToken = null;
  await user.save();
  res.send({ message: "Password has been reset successfully" });


}



export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  passwordResetRequest,
  passwordResetConfirm
};
