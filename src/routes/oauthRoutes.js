const express = require('express');
const passport = require('passport');
const tokenService = require('../services/tokenService');

const router = express.Router();

function issueTokensAndRedirect(req, res) {
  if (!req.user) {
    const errorUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`;

    return res.redirect(errorUrl);
  }

  // Generate our custom Application JWTs
  const accessToken = tokenService.generateAccessToken(req.user);
  const refreshToken = tokenService.generateRefreshToken(req.user);

  // Set HTTP-Only cookies so the frontend automatically is authenticated
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15 minutos
    sameSite: 'lax',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    sameSite: 'lax',
  });

  // Redirect to React frontend Dashboard
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/`);
}

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth' }),
  issueTokensAndRedirect,
);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] }),
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login?error=oauth' }),
  issueTokensAndRedirect,
);

// Apple OAuth
router.get('/apple', (req, res, next) => {
  if (!process.env.APPLE_CLIENT_ID || !process.env.APPLE_PRIVATE_KEY) {
    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=apple_not_configured`,
    );
  }
  passport.authenticate('apple')(req, res, next);
});

router.post('/apple/callback', function (req, res, next) {
  passport.authenticate('apple', function (err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/login?error=oauth_apple');
    }

    req.logIn(user, function (loginErr) {
      if (loginErr) {
        return next(loginErr);
      }

      return issueTokensAndRedirect(req, res);
    });
  })(req, res, next);
});

module.exports = router;
