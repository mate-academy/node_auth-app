import { normalizeUser } from '../utils/normalizeUser.js';
import { profileService } from '../services/profile.service.js';
import { socialAccountService } from '../services/socialAccount.servise.js';
import { ApiError } from '../exeptions/api.error.js';

const changeName = async (req, res) => {
  const { id } = req.user;
  const { name } = req.body;

  const user = await profileService.changeName({ id, name });

  res.send({
    user: normalizeUser(user),
  });
};

const changePassword = async (req, res) => {
  const { id } = req.user;
  const { oldPassword, password, confirmation } = req.body;

  const user = await profileService.changePassword({
    id,
    oldPassword,
    password,
    confirmation,
  });

  res.send({
    user: normalizeUser(user),
  });
};

const changeEmail = async (req, res) => {
  const { password, confirmation, email } = req.body;
  const { id } = req.user;

  const user = await profileService.changeEmail({
    id,
    password,
    confirmation,
    email,
  });

  res.send({
    user: normalizeUser(user),
  });
};

const getProfile = async (req, res) => {
  const { id } = req.user;
  const { user, socialAccounts } = await profileService.getProfile(id);

  res.send({
    user: normalizeUser(user),
    socialAccounts,
  });
};

const removeSocialAccount = async (req, res) => {
  const { id } = req.user;
  const { provider } = req.params;

  const removed = await socialAccountService.removeSocialAccount(id, provider);

  if (!removed) {
    throw ApiError.notFound('Social account not found');
  }

  res.sendStatus(204);
};

const addSocialAccount = async (req, res) => {
  const { id } = req.user;
  const { provider } = req.params;
  const { providerAccountId } = req.body;

  await socialAccountService.addSocialAccount(id, provider, providerAccountId);

  res.sendStatus(201);
};

export const profileController = {
  changeName,
  changePassword,
  changeEmail,
  getProfile,
  removeSocialAccount,
  addSocialAccount,
};
