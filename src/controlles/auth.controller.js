import uuid4 from "uuid4"
import { User } from "../models/user.js"
import { emailService } from "../services/email.service.js"
import { userService } from "../services/user.service.js"
import { jwtService } from "../services/jwt.service.js"
import { ApiError } from "../exeptions/api.error.js"
import bcrypt from 'bcrypt';
import { tokenService } from "../services/token.service.js"

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

const generateTokens = async (res, user) => {
  const normalizeUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizeUser);
  const refreshAccessToken = jwtService.signRefresh(normalizeUser);

  await tokenService.save(normalizeUser.id, refreshAccessToken)
  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  })

  res.send({
    user: normalizeUser,
    accessToken
  })

}

const register = async (req, res) => {
  const { email, password: pass, name } = req.body
  const activationToken = uuid4();

  const errors = {
    email: validateEmail(email),
    password: validatePassword(pass)
  }

  if (!errors.email) {
    throw ApiError.bedRequest('Invalid email address. Please enter a valid email address in the format "example@example.com".', errors)
  }

  if (!errors.password) {
    throw ApiError.bedRequest('Incorrect password. The length of the fault must be at least 6 characters', errors)
  }

  const existUser = await userService.findByEmail(email)

  if (existUser) {
    throw ApiError.bedRequest('User Already exist', {
      email: 'User already exist'
    })
  }

  const password = await bcrypt.hash(pass, 10)
  const newUser = await User.create({ email, password, name, activationToken })
  await emailService.sendActivationEmail(email, activationToken)
  res.send(newUser)

}

const activate = async (req, res) => {
  const { activationToken } = req.params;


  const user = await User.findOne({ where: { activationToken } })

  if (!user) {
    res.sendStatus(404);
    return;
  }
  try {
    user.activationToken = null;
    user.save();

    res.send(user)
  } catch (err) {
    res.status(500).send(err);
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email)

  if (!user) {
    throw ApiError.bedRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw ApiError.bedRequest('Wrong password');
  }

  if (user.activationToken) {
    return res.status(403).send('Confirm your email');
  }

  await generateTokens(res, user);

  res.redirect(`/user/${user.id}`);
}

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);
  await generateTokens(res, user)
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove()
  res.sendStatus(204);
}


export const authController = {
  register: register,
  activate,
  login,
  refresh,
  logout
}
