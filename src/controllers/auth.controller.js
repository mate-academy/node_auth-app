import { User, FindByEmail } from '../models/user.js';
import { v4 } from 'uuid';

import { emailService } from '../email.js';

import { confirmedEmail } from '../pages/confirmed-email.js';

import jwt from 'jsonwebtoken';

export const controllerRegister = async (req, res) => {
  const token = v4();

  const { email, password, username } = req.body;

  // const newUser =

  await User.create({
    email,
    password,
    username,
    token,
  });

  await emailService.sendConfirmEmail(email, token);

  // res.send(newUser);

  res.redirect('/confirm-email');
};

export const activate = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { token } });

  if (!user) {
    res.sendStatus(404);
  }

  user.token = null;
  await user.save();
  res.send(confirmedEmail);
};

export const sign = (user) => {
  const token = jwt.sign(user, process.env.JWT_KEY);

  return token;
};

export const verify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return null;
  }
};

export const loginSystem = async (req, res) => {
  const { email, password } = req.body;

  const user = await FindByEmail(email);

  if (!user || user.password !== password) {
    res.send(401);
  } else {
    // login
    const acesstoken = sign(user);

    res.send({
      user,
      acesstoken,
    });
  }
};
