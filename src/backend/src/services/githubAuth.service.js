'use strict';

const { sequelize } = require('../db');
const { User } = require('../models/user.model');
const { SocialAccount } = require('../models/socialAccount.model');
const { ApiError } = require('../utils/ApiError');
const jwtService = require('./jwt.service');
const userService = require('./user.service');
const { GITHUB_PROVIDER } = require('./socialAccount.service');

function getPrimaryEmail(profile) {
  const email = profile.emails.find(Boolean) || '';

  return String(email).trim();
}

function getDisplayName(profile, email) {
  const fallbackName = email.split('@')[0] || 'GitHub user';

  return String(profile.displayName || profile.username || fallbackName).trim();
}

async function finalizeGitHubAuthentication(profile, linkUserId = null) {
  const providerUserId = String(profile.providerUserId || '').trim();

  if (!providerUserId) {
    throw ApiError.badRequest('GitHub did not return a valid user id.');
  }

  const email = getPrimaryEmail(profile);

  if (!email) {
    throw ApiError.badRequest('Error');
  }

  const name = getDisplayName(profile, email);

  return sequelize.transaction(async (transaction) => {
    const existingSocialAccount = await SocialAccount.findOne({
      where: {
        provider: GITHUB_PROVIDER,
        providerUserId,
      },
      transaction,
    });

    if (linkUserId) {
      const linkedUser = await userService.findById(linkUserId, {
        transaction,
      });

      if (!linkedUser) {
        throw ApiError.notFound('User not found');
      }

      if (existingSocialAccount) {
        if (existingSocialAccount.userId !== linkedUser.id) {
          throw ApiError.badRequest(
            'This GitHub account is already linked to another user.',
          );
        }

        return {
          accessToken: null,
          message: 'GitHub is already connected to your account.',
          redirectPath: '/account',
        };
      }

      await SocialAccount.create(
        {
          provider: GITHUB_PROVIDER,
          providerUserId,
          providerEmail: email,
          userId: linkedUser.id,
        },
        { transaction },
      );

      return {
        accessToken: null,
        message: 'GitHub account connected successfully.',
        redirectPath: '/account',
      };
    }

    if (existingSocialAccount) {
      const existingUser = await userService.findById(
        existingSocialAccount.userId,
        {
          transaction,
        },
      );

      if (!existingUser) {
        throw ApiError.notFound('User not found');
      }

      if (existingUser.activationToken) {
        existingUser.activationToken = null;
        await existingUser.save({ transaction });
      }

      return {
        accessToken: jwtService.sign({
          id: existingUser.id,
          email: existingUser.email,
        }),
        message: 'Signed in with GitHub.',
        redirectPath: '/account',
      };
    }

    let user = await userService.findByEmailCaseInsensitive(email, {
      transaction,
    });

    if (!user) {
      user = await User.create(
        {
          name,
          email,
          password: null,
          activationToken: null,
        },
        { transaction },
      );
    } else if (user.activationToken) {
      user.activationToken = null;
      await user.save({ transaction });
    }

    await SocialAccount.create(
      {
        provider: GITHUB_PROVIDER,
        providerUserId,
        providerEmail: email,
        userId: user.id,
      },
      { transaction },
    );

    return {
      accessToken: jwtService.sign({ id: user.id, email: user.email }),
      message: 'Your GitHub account is ready to use.',
      redirectPath: '/account',
    };
  });
}

module.exports = {
  finalizeGitHubAuthentication,
};
