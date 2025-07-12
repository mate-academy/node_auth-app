import { User } from "../models/user.js";
import { sendActivationMail, sendPasswordResetEmail } from "../services/mail-service.js";
import { consumeActivationToken, findActivatedUserByEmail, generateActivationToken } from "../services/users-service.js";
import { ApiError } from "../exceptions/api-error.js";
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { validateEmail, validatePassword, validateUserName } from "../utils/validation.js";
import { createAccessToken, createRefreshToken, readRefreshToken } from "../services/jwt-service.js";
import { tokenService } from "../services/tokens-service.js";

async function register(req, res, next) {
  const { email, password, name } = req.body;

      const existedUser = await User.findOne({
        where: {email}
    })

    const existedName = await User.findOne({
      where: {name}
    })



    if (existedUser !== null) {
        throw ApiError.BadRequest("User already exists", {
            email: "This e-mail address is used by another user"
        });
    }

        if (existedName !== null) {
      throw ApiError.BadRequest("This username already exists", {
        username: "This username is used by another user"
      })
    }

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const userNameError = validateUserName(name);

  if (emailError) {
    throw ApiError.BadRequest('Bad Request', {
      message: emailError,
    })
  }

  if (passwordError) {
    throw ApiError.BadRequest('Bad Request', {
      message: passwordError,
    }
    )
  }

  if (userNameError) {
    throw ApiError.BadRequest('Bad Request', {
      message: userNameError,
    }
    )
  }
  const activationToken = generateActivationToken();

  const userLength = await User.count()
    const id = userLength + 1;

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({id, email, name, password: hashPassword, activationToken})



    await sendActivationMail(email, activationToken);

    res.status(201).send({
      id: user.id,
      username: user.name,
    })
}

async function logout(req, res, next) {

  const {refreshToken} = req.cookies;

  const userData = readRefreshToken(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.end();

}

async function activate(req, res, next) {
  const {activationToken} = req.params;

  const user = await User.findOne({
    where: {activationToken},
    attributes: ['id', 'email'],
  });

  if (!user) {
    throw ApiError.NotFound();
  }

  await consumeActivationToken(user);

  res.send(`User with id ${user.id} is activated`);

}

async function login(req, res, next) {
  const { name, password} = req.body;

  const user = await User.findOne({
    where: {name}
  })

    if (!user) {
    throw ApiError.NotFound();
  }

  if (user.activationToken !== null) {
    throw ApiError.BadRequest("User is not activated", {
      email: "Please activate your account first"
    });
  }

  if (!await bcrypt.compare(password, user.password)) {
    throw ApiError.Unauthorized();
  }

  return sendAuth(user, res);
}

async function sendAuth(user, res) {

    const accessToken = createAccessToken({id: user.id, email: user.email})

  const refreshToken = createRefreshToken({id: user.id, email: user.email});

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24* 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    accessToken,
    user: {
      email: user.email,
    }
  })

}

    async function refresh(req, res, next) {
  const {refreshToken} = req.cookies;

  const userData = readRefreshToken(refreshToken);

  if (userData === null) {
    throw ApiError.Unauthorized();
  }

  const token = tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await findActivatedUserByEmail(userData.email);

  return sendAuth(user, res);


}

async function sendReset(req, res, next) {
  const {email} = req.body;
  const user = await User.findOne({
    where: {email, activationToken: null}
  })

  if (!user) {
    throw ApiError.NotFound();
  }

  console.log(user)


  const token = generateActivationToken();

    await sendPasswordResetEmail(user?.email, token);

    user.resetToken = token;

    await user.save();

  res.status(200).send(`Password reset email sent on user with id ${user.id}`)
}

async function resetPassword(req, res, next) {
  const {resetToken} = req.params;
  const {oldPassword, newPassword, confirmPassword} = req.body;

  const passwordError = validatePassword(newPassword);

  const hashNewPassword = await bcrypt.hash(newPassword, 10);
  const user = await User.findOne({
    where: {resetToken}
  })

  if (!user) {
    throw ApiError.NotFound();
  }

  if (!await bcrypt.compare(oldPassword, user.password)) {
    throw ApiError.BadRequest("Wrong Password", {
      password: "This password is wrong"
    })
  }

  if (await bcrypt.compare(newPassword, user.password)) {
    throw ApiError.BadRequest("Wrong Password", {
      password: "New password must be different than old password"
    })
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.BadRequest("Wrong Password", {
      password: "Passwords are different"
    })
  }

  if (passwordError) {
    throw ApiError.BadRequest("Wrong password", {
      message: passwordError,
    })
  }

  user.resetToken = null;
  user.password = hashNewPassword;

  await user.save();

  res.status(200).send("Password changed successfully");
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  sendReset,
  resetPassword,
};

