'use strict';

const { SocialAccount } = require('../models/socialAccount.model');
const { ApiError } = require('../utils/ApiError');
const userService = require('./user.service');

const GITHUB_PROVIDER = 'github';

function normalize(account) {
  return {
    provider: account.provider,
  };
}

function findByProviderAccount(provider, providerUserId, options = {}) {
  return SocialAccount.findOne({
    where: { provider, providerUserId },
    ...options,
  });
}

function findByUserAndProvider(userId, provider, options = {}) {
  return SocialAccount.findOne({
    where: { userId, provider },
    ...options,
  });
}

function listByUserId(userId, options = {}) {
  return SocialAccount.findAll({
    where: { userId },
    order: [['createdAt', 'ASC']],
    ...options,
  });
}

async function removeByUserAndProvider({ userId, provider }) {
  const user = await userService.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const socialAccount = await findByUserAndProvider(userId, provider);

  if (!socialAccount) {
    throw ApiError.notFound('Social account not found');
  }

  const linkedAccountsCount = await SocialAccount.count({
    where: { userId },
  });

  if (!user.password && linkedAccountsCount <= 1) {
    throw ApiError.badRequest(
      'Set a password before removing your only social sign-in method.',
    );
  }

  await socialAccount.destroy();
}

module.exports = {
  GITHUB_PROVIDER,
  normalize,
  findByProviderAccount,
  findByUserAndProvider,
  listByUserId,
  removeByUserAndProvider,
};
