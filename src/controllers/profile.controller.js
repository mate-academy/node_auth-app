const profileService = require('../services/profile.service');
const { getTokenFromRequest } = require('../utils/getTokenFromRequest');

const passReset = async (req, res) => {
  const accessToken = getTokenFromRequest(req);
  const updatedUser = await profileService.passReset(accessToken);

  res.send(updatedUser);
};

const passResetConfirm = async (req, res) => {
  const { userId } = req.params;
  const { newPass, newPassConfirmation } = req.body;
  const newUser = await profileService.passResetConfirm(
    userId,
    newPass,
    newPassConfirmation,
  );

  res.send(newUser);
};

const changeName = async (req, res) => {
  const accessToken = getTokenFromRequest(req);
  const { newName } = req.body;
  const updatedUser = await profileService.changeName(newName, accessToken);

  res.send(updatedUser);
};

const changeEmail = async (req, res) => {
  const accessToken = getTokenFromRequest(req);
  const { newEmail, password } = req.body;
  const user = await profileService.changeEmail(
    newEmail,
    password,
    accessToken,
  );

  res.send(user);
};

const changeEmailConfirm = async (req, res) => {
  const { accessToken } = req.params;
  const { newEmail } = req.body;
  const updatedUser = await profileService.changeEmailConfirm(
    newEmail,
    accessToken,
  );

  res.send(updatedUser);
};

module.exports = {
  passReset,
  passResetConfirm,
  changeName,
  changeEmail,
  changeEmailConfirm,
};
