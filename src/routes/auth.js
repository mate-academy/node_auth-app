// src/routes/auth.js
const { Router } = require('express');
const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const guest = require('../middleware/guest');
const auth = require('../middleware/auth');

const router = Router();

// POST /auth/register (guest-only)
router.post('/register', guest, async (req, res) => {
  const { name, email, password } = req.body;
  const activationToken = randomBytes(32).toString('hex');
  const activationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, activationToken, activationTokenExpires },
  });

  // TODO: enviar e-mail com activationToken (omisso; log para dev)
  console.log('Activation link token:', activationToken);

  return res.status(201).json({ id: user.id });
});

// POST /auth/activate (guest-only) ?token=...
router.post('/activate', guest, async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const user = await prisma.user.findUnique({ where: { activationToken: token } });
  if (!user || !user.activationTokenExpires || user.activationTokenExpires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      activationToken: null,
      activationTokenExpires: null,
    },
  });

  // Redirecionar para Profile (exigência do spec)
  return res.redirect(302, '/profile');
});

// POST /auth/login (guest-only)
router.post('/login', guest, async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Enviar em cookie httpOnly (ou bearer)
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Redirecionar para Profile (exigência do spec)
  return res.redirect(302, '/profile');
});

// POST /auth/logout (auth-only)
router.post('/logout', auth, async (_req, res) => {
  res.clearCookie('token');
  // Redirecionar para Login (exigência do spec)
  return res.redirect(302, '/login');
});

// Password reset: request (guest-only)
router.post('/password-reset', guest, async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // resposta 202 mesmo se user inexistente (para não vazar existência)
  if (user) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    // TODO: enviar e-mail com link contendo token; log p/ dev
    console.log('Password reset token:', token);
  }

  return res.status(202).json({ ok: true });
});

// Password reset: confirm (guest-only)
router.post('/password-reset/confirm', guest, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Invalid payload' });

  const pr = await prisma.passwordReset.findUnique({ where: { token } });
  if (!pr || pr.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid or expired token' });

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: pr.userId }, data: { passwordHash } }),
    prisma.passwordReset.delete({ where: { id: pr.id } }),
  ]);

  return res.status(200).json({ ok: true });
});

module.exports = router;
