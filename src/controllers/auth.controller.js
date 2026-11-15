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
    res.sendStatus(401);
  } else {
    // login

    res.send = `
    <link rel="stylesheet" href="/styles/main.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <div class="account">
    <div class="container">
    <h1>Olá, bem-vindo(a), ${user}</h1>
    <div class="box"><div>
    <a href="/change-password" class="btn">Mudar Senha</a>
    <a href="/logout" class="btn">Logout</a>
    </div>
    </div>
    </div>
    </div>
    `;
  }
};
