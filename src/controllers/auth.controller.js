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
    return res.send(registerInvalid);
  }

  await userService.register(name, email, password);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  user.save();

  await sendAuthentication(res, user);
};

const loginGet = async (req, res) => {
  const html = `
    <h1>Login page</h1>
  `;

  res.send(html);
};

const loginPost = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);
  const loginInvalid = validationService.login(email, password, user);

  if (loginInvalid) {
    return res.send(loginInvalid);
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { id } = req.body;

  const token = await tokenService.getByUserId(id);

  if (!token) {
    return res.send('You are not authorized');
  }
  await tokenService.destroy(+id);

  res.redirect(`http://localhost:${process.env.PORT}/authorization/login`);
};

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const authToken = jwtService.generateAuthToken(userData);

  const userToken = await tokenService.getByUserId(user.id);

  if (userToken) {
    return res.send('User already authorized');
  }

  await tokenService.createToken(user.id, authToken);
  res.redirect(`http://localhost:${process.env.PORT}/profile/${user.id}`);
}

export const authController = {
  register,
  activate,
  loginGet,
  loginPost,
  logout,
};
