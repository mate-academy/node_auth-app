import { ApiError } from '../exeptions/api.error.js';
import { SocialAccount } from '../models/socialAccount.js';
import { User } from '../models/user.js';

const googleLogin = async (profile) => {
  const account = await SocialAccount.findOne({
    where: {
      provider: 'google',
      providerAccountId: profile.id,
    },
  });

  if (account) {
    return User.findOne({
      where: { id: account.userId },
    });
  }

  const googleEmail = profile.emails[0].value;
  let existingUser = await User.findOne({
    where: { email: googleEmail },
  });

  if (!existingUser) {
    existingUser = await User.create({
      name: profile.displayName,
      email: googleEmail,
      isActive: true,
    });
  }

  await SocialAccount.create({
    provider: 'google',
    providerAccountId: profile.id,
    userId: existingUser.id,
  });

  return existingUser;
};

const githubLogin = async (profile, accessToken) => {
  const account = await SocialAccount.findOne({
    where: {
      provider: 'github',
      providerAccountId: profile.id,
    },
  });

  if (account) {
    return User.findOne({
      where: { id: account.userId },
    });
  }

  const response = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });

  const emails = await response.json();

  const primaryEmail = emails.find((item) => item.primary && item.verified);

  if (!primaryEmail) {
    throw ApiError.badRequest('No verified email found');
  }

  const githubEmail = primaryEmail.email;

  let existingUser = await User.findOne({
    where: { email: githubEmail },
  });

  if (!existingUser) {
    existingUser = await User.create({
      name: profile.displayName || profile.username,
      email: githubEmail,
      isActive: true,
    });
  }

  await SocialAccount.create({
    provider: 'github',
    providerAccountId: profile.id,
    userId: existingUser.id,
  });

  return existingUser;
};

const removeSocialAccount = async (userId, provider) => {
  const result = await SocialAccount.destroy({
    where: {
      userId: userId,
      provider: provider,
    },
  });

  return result > 0;
};

const addSocialAccount = async (userId, provider, providerAccountId) => {
  let socialAccount = await SocialAccount.findOne({
    where: {
      provider,
      providerAccountId,
    },
  });

  if (!socialAccount) {
    socialAccount = await SocialAccount.create({
      provider,
      providerAccountId,
      userId,
    });
  }

  return socialAccount;
};

export const socialAccountService = {
  googleLogin,
  githubLogin,
  removeSocialAccount,
  addSocialAccount,
};
