import express from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { isNotAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
});

// Logging middleware
router.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Auth route accessed: ${req.method} ${req.path}`,
  );
  next();
});

// Health check endpoint
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      email: 'ready',
      oauth: {
        google: 'enabled',
        facebook: 'enabled',
        github: 'enabled',
      },
    },
  });
});

// CSRF token endpoint
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Local Authentication Routes
router.post(
  '/register',
  isNotAuthenticated,
  authLimiter,
  csrfProtection,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
  ],
  authController.register,
);

router.get(
  '/activate/:token',
  isNotAuthenticated,
  authController.activateAccount,
);

router.post(
  '/login',
  isNotAuthenticated,
  authLimiter,
  csrfProtection,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  authController.login,
);

router.get('/logout', authController.logout);

// Password Reset Routes
router.post(
  '/forgot-password',
  isNotAuthenticated,
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  authController.forgotPassword,
);

router.patch(
  '/reset-password/:token',
  isNotAuthenticated,
  authLimiter,
  body('password').isLength({ min: 8 }),
  authController.resetPassword,
);

// OAuth Strategy Handler (used by all providers)
const handleOAuthSuccess = (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
    const { token, refreshToken } = authController.signToken(req.user._id);

    // Set cookies
    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    // Redirect handling
    if (isMobile) {
      return res.redirect(
        `${process.env.MOBILE_APP_SCHEME}://auth?token=${token}`,
      );
    }

    const redirectUrl = process.env.OAUTH_SUCCESS_REDIRECT || '/profile';

    res.redirect(`${redirectUrl}?token=${token}`);
  } catch (err) {
    console.error('OAuth callback error:', err);

    res.redirect(
      `/login?error=auth-failed&provider=${req.query.provider || 'unknown'}`,
    );
  }
};

// Google OAuth Routes
router.get(
  '/google',
  isNotAuthenticated,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    accessType: 'offline',
  }),
);

router.get(
  '/google/callback',
  isNotAuthenticated,
  passport.authenticate('google', {
    failureRedirect: '/login?error=google-auth-failed',
    session: false,
  }),
  handleOAuthSuccess,
);

// Facebook OAuth Routes
router.get(
  '/facebook',
  isNotAuthenticated,
  passport.authenticate('facebook', {
    scope: ['email'],
    authType: 'reauthenticate',
  }),
);

router.get(
  '/facebook/callback',
  isNotAuthenticated,
  passport.authenticate('facebook', {
    failureRedirect: '/login?error=facebook-auth-failed',
    session: false,
  }),
  handleOAuthSuccess,
);

// GitHub OAuth Routes
router.get(
  '/github',
  isNotAuthenticated,
  passport.authenticate('github', {
    scope: ['user:email'],
  }),
);

router.get(
  '/github/callback',
  isNotAuthenticated,
  passport.authenticate('github', {
    failureRedirect: '/login?error=github-auth-failed',
    session: false,
  }),
  handleOAuthSuccess,
);

// Refresh token endpoint
router.post(
  '/refresh',
  (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ status: 'fail', message: 'No refresh token provided' });
    }
    next();
  },
  authController.refreshToken,
);

// 404 Handler for undefined auth routes
router.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Auth route ${req.originalUrl} not found`,
    availableEndpoints: [
      'POST /register',
      'GET /activate/:token',
      'POST /login',
      'GET /logout',
      'POST /forgot-password',
      'PATCH /reset-password/:token',
      'GET /google',
      'GET /facebook',
      'GET /github',
      'POST /refresh',
      'GET /status',
    ],
  });
});

export default router;
