import { userService } from '../services/userService.js';

async function getAll(req, res, next) {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
}

const changeName = async (req, res) => {
  const { name } = req.body;
  const { refreshToken } = req.cookies;

  const userToken = jwtService.verifyRefresh(refreshToken);
  const user = await userService.findByEmail(userToken.email);

  user.name = name;
  user.save();

  res.sendStatus(200);
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;
  const { refreshToken } = req.cookies;

  const userToken = jwtService.verifyRefresh(refreshToken);
  const user = await userService.findByEmail(userToken.email);

  const isPassWordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isPassWordCorrect) {
    throw ApiError.BadRequest('password is not correct');
  }

  if (newPassword !== confPassword) {
    throw ApiError.BadRequest('Passwords dont match');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;
  await user.save();

  res.send(204);
};

const changeEmail = async (req, res) => {
  const { password, email } = req.body;

  const { refreshToken } = req.cookies;

  const userToken = jwtService.verifyRefresh(refreshToken);
  const user = await userService.findByEmail(userToken.email);

  if (!userToken) {
    throw ApiError.Unauthorized();
  }

  const isPassWordCorrect = await bcrypt.compare(password, user.password);

  if (!isPassWordCorrect) {
    throw ApiError.BadRequest('password is not correct');
  }

  await emailService.sendChangeEmail(email);

  res.sendStatus(204);
};

const activeEmail = async (req, res) => {
  const { email } = req.params;
  const { refreshToken } = req.cookies;

  const userToken = jwtService.verifyRefresh(refreshToken);
  const user = await userService.findByEmail(userToken.email);

  if (!user || !userToken) {
    res.sendStatus(401);

    return;
  }

  const oldEmail = user.email;

  user.email = email;
  await user.save();

  await emailService.sendOldEmailNotUsed(oldEmail);

  res.sendStatus(201);
};

export const userController = {
  getAll,
  changeName,
  changePassword,
  changeEmail,
  activeEmail,
};
