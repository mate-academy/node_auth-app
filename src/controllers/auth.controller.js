import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { validationService } from '../services/validation.service.js';

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await userService.getByEmail(email);
  const registerInvalid = validationService.register(
    email,
    password,
    name,
    user,
  );

  if (registerInvalid) {
    res.send(registerInvalid);

    return;
  }

  await userService.register(name, email, password);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  await sendAuthentication(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);
  const loginInvalid = validationService.login(email, password, user);

  if (loginInvalid) {
    res.send(loginInvalid);

    return;
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { id } = req.body;

  await tokenService.destroy(+id);
  res.redirect(`http://localhost:${process.env.PORT}/login`);
};

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const authToken = jwtService.generateAuthToken(userData);

  const userToken = await tokenService.getByUserId(user.id);

  if (userToken) {
    res.send('User already authorized');

    return;
  }

  res.cookie('authToken', authToken);

  await tokenService.createToken(user.id, authToken);
  res.redirect(`http://localhost:${process.env.PORT}/users/profile`);
}

export const authController = {
  register,
  activate,
  login,
  logout,
};
