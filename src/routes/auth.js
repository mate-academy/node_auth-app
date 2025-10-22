// src/routes/auth.js
const { Router } = require('express');
const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const {
  sendActivationEmail,
  sendPasswordResetEmail,
} = require('../services/email');
const {
  issueAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  pruneExpired,
} = require('../services/tokenService');
const guest = require('../middleware/guest');
<<<<<<< HEAD
// password rules: at least 8 chars, 1 uppercase, 1 number
function isStrongPassword(pw) {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
}

=======
const { isStrongPassword, isValidEmail } = require('../utils/validators');
>>>>>>> 0fe3a41 (fix: migrations, auth flows, email, middlewares, 404_V2)
const auth = require('../middleware/auth');

const router = Router();

/**
 * REGISTER (guest-only)
 * - cria usuario com activationToken + activationTokenExpires
 * - envia e-mail de ativação (NO_EMAIL=1 => loga no console)
 */
router.post('/register', guest, async (req, res) => {
  const { name, email, password } = req.body;

  const activationToken = randomBytes(32).toString('hex');
  const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, passwordHash, activationToken, activationTokenExpires },
  });

  try {
    await sendActivationEmail(email, activationToken);
  } catch (e) {
    console.error('sendActivationEmail failed:', e.message);
  }

  return res.status(201).json({ ok: true });
});

/**
 * ACTIVATE (guest-only)
 * - valida token e expiração
 * - ativa usuário
 * - EMITE sessão (access+refresh cookies) antes do redirect
 * - redirect -> /profile
 */
router.post('/activate', guest, async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const user = await prisma.user.findUnique({ where: { activationToken: token } });
  if (!user) return res.status(400).json({ error: 'Invalid token' });
  if (!user.activationTokenExpires || user.activationTokenExpires < new Date()) {
    return res.status(400).json({ error: 'Activation token expired' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true, activationToken: null, activationTokenExpires: null },
  });

  // cria sessão para que o /profile já abra autenticado após o redirect
  const access = issueAccessToken(user.id);
  const refresh = await issueRefreshToken(user.id);

  res.cookie('accessToken', access, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie('refreshToken', refresh.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });

  return res.redirect(302, '/profile');
});

/**
 * LOGIN (guest-only)
 * - responde mensagem específica para conta inativa
 * - emite cookies e redireciona para /profile
 */
router.post('/login', guest, async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  if (!user.isActive) {
    return res.status(403).json({ error: 'Please activate your account' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const access = issueAccessToken(user.id);
  const refresh = await issueRefreshToken(user.id);

  res.cookie('accessToken', access, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refresh.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.redirect(302, '/profile');
});

/**
 * REFRESH (guest-only)
 * - rota pública que aceita apenas refresh válido no cookie/body
 * - valida no DB, faz rotação, devolve novo access+refresh (cookies)
 */
router.post('/refresh', guest, async (req, res) => {
  try {
    await pruneExpired();

    const old = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!old) return res.status(400).json({ error: 'Refresh token required' });

    const { userId, token: newRT } = await rotateRefreshToken(old);
    const newAT = issueAccessToken(userId);

    res.cookie('accessToken', newAT, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', newRT, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * LOGOUT (auth-only)
 * - revoga refresh atual e limpa cookies
 * - redirect -> /login
 */
router.post('/logout', auth, async (req, res) => {
  const rt = req.cookies?.refreshToken;
  if (rt) {
    await prisma.refreshToken.updateMany({
      where: { token: rt, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.redirect(302, '/login');
});

/**
 * PASSWORD RESET — request (guest-only)
 * - cria token com expiry, persiste e envia e-mail (ou loga)
 * - sempre responde 202 (não revela existência do e-mail)
 */
router.post('/password-reset', guest, async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await prisma.passwordReset.create({ data: { token, userId: user.id, expiresAt } });
    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (err) {
      console.error('sendPasswordResetEmail failed:', err.message);
    }
  }

  return res.status(202).json({ ok: true });
});

/**
 * PASSWORD RESET — confirm (guest-only)
 * - valida token/expiry, atualiza hash, apaga token
 */
router.post('/password-reset/confirm', guest, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Invalid payload' });

  const pr = await prisma.passwordReset.findUnique({ where: { token } });
  if (!pr || pr.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: pr.userId }, data: { passwordHash } }),
    prisma.passwordReset.delete({ where: { id: pr.id } }),
  ]);

  return res.status(200).json({ ok: true });
});

module.exports = router;
