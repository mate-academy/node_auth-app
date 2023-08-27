/* eslint-disable no-console */
/* eslint-disable quotes */
import bcrypt from "bcrypt";
import { ApiError } from "../exceptions/ApiError.js";
import { User } from "../models/user.js";
import { jwtService } from "../services/jwtService.js";
import { tokenService } from "../services/tokenService.js";
import { userService } from "../services/userService.js";
import { emailService } from "../services/emailService.js";
import { v4 as uuidv4 } from "uuid";

function validateEmail(value) {
  if (!value) {
    return "Email is required";
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return "Email is not valid";
  }
}

function validatePassword(value) {
  if (!value) {
    return "Password is required";
  }

  if (value.length < 6) {
    return "At least 6 characters";
  }
}

async function register(req, res, next) {
  const { email, fullName, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest("Validation error", errors);
  }

  const user = await userService.register({
    email,
    fullName,
    password,
  });

  res.send({
    message: "OK",
    user: userService.normalize(user),
  });
}

async function recover(req, res, next) {
  const { email } = req.params;

  try {
    const user = await userService.getByEmail(email);

    if (!user) {
      throw ApiError.BadRequest("User with this email does not exist");
    }

    const token = uuidv4();

    user.recoverToken = token;

    await user.save();

    await emailService.sendRecoverLink(email, token);

    res.send({
      status: "OK",
    });
  } catch (error) {
    res.sendStatus(500);
  }
}

async function checkRecoverToken(req, res, next) {
  const { email, token } = req.body;

  try {
    const user = await userService.getByEmail(email);

    if (!user) {
      throw ApiError.BadRequest("User with this email does not exist");
    }

    if (user.recoverToken === token) {
      res.send({
        status: "OK",
      });
    } else {
      res.send({
        status: "DECLINED",
      });
    }
  } catch (error) {
    res.sendStatus(500).send({
      status: "error",
    });
  }
}

async function reset(req, res, next) {
  const { email, password } = req.body;

  try {
    await userService.reset(email, password);

    res.send({
      status: "OK",
    });
  } catch (error) {
    res.sendStatus(500).send({
      status: "error",
    });
  }
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

async function checkPassword(email, password) {
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest("User with this email does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest("Password is wrong");
  }

  return user;
}

async function login(req, res, next) {
  const { email, password } = req.body;

  const user = await checkPassword(email, password);

  if (user) {
    await sendAuthentication(res, user);
  }
}

async function refresh(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie("refreshToken");

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

  res.cookie("refreshToken", refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
    isActivated: !user.activationToken,
  });
}

async function reauth(req, res, next) {
  const { email, password } = req.body;

  const user = await checkPassword(email, password);

  if (user) {
    res.send({
      status: "OK",
    });
  } else {
    res.send({
      status: "Failed",
    });
  }
}

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  recover,
  checkRecoverToken,
  reset,
  checkPassword,
  reauth,
};
