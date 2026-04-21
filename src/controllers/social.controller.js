const { User, SocialAccount } = require('../models');
const { jwtService, tokenService, usersService } = require('../services');

const oauthCallback = async (req, res) => {
  const profile = req.user; // Passed from passport.authenticate
  const { provider, id: providerId, emails, displayName } = profile;

  const email = emails && emails[0] ? emails[0].value : null;

  const { refreshToken } = req.cookies;
  let currentUser = null;

  if (refreshToken) {
    const userData = jwtService.validateRefreshToken(refreshToken);

    if (userData) {
      currentUser = await User.findByPk(userData.id);
    }
  }

  const socialAccount = await SocialAccount.findOne({
    where: { provider, providerId },
  });

  if (currentUser) {
    if (!socialAccount) {
      await SocialAccount.create({
        userId: currentUser.id,
        provider,
        providerId,
      });
    }

    return res.redirect(
      (process.env.CLIENT_URL || 'http://localhost:5173') + '/profile',
    );
  } else {
    let targetUser;

    if (socialAccount) {
      targetUser = await User.findByPk(socialAccount.userId);
    } else if (email) {
      targetUser = await User.findOne({ where: { email } });

      if (!targetUser) {
        targetUser = await User.create({
          name: displayName || email.split('@')[0],
          email,
          password: null,
          activationToken: null,
        });
      }

      await SocialAccount.create({
        userId: targetUser.id,
        provider,
        providerId,
      });
    }

    if (!targetUser) {
      return res.redirect(
        (process.env.CLIENT_URL || 'http://localhost:5173') +
          '/login?error=auth_failed',
      );
    }

    const userData = usersService.normalize(targetUser);
    const newRefreshToken = jwtService.generateRefreshToken(userData);

    await tokenService.save(userData.id, newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.redirect(
      (process.env.CLIENT_URL || 'http://localhost:5173') + `/profile`,
    );
  }
};

module.exports = {
  oauthCallback,
};
