// src/routes/profile.js
const { Router } = require('express');
const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const auth = require('../middleware/auth');

const router = Router();

// GET /profile (auth-only)
router.get('/', auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, isActive: true, createdAt: true, updatedAt: true },
  });
  return res.json(user);
});

// PATCH /profile/name (auth-only)
router.patch('/name', auth, async (req, res) => {
  const { name } = req.body;
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { name } });
  return res.json({ id: user.id, name: user.name });
});

// PATCH /profile/password (auth-only; exige senha antiga + confirmação)
router.patch('/password', auth, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Old password is incorrect' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return res.json({ ok: true });
});

// PATCH /profile/email (auth-only; inicia fluxo com verificação + notifica e-mail antigo)
router.patch('/email', auth, async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) return res.status(400).json({ error: 'newEmail required' });

  const emailChangeToken = randomBytes(32).toString('hex');
  const emailChangeTokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1h

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { pendingEmail: newEmail, emailChangeToken, emailChangeTokenExpires },
    select: { email: true, pendingEmail: true, emailChangeToken: true },
  });

  // Notificar e-mail antigo (placeholder: log para dev)
  console.log(`Notify old email ${user.email}: request to change to ${user.pendingEmail}`);
  // Enviar link de verificação ao novo e-mail (placeholder: log)
  console.log('Email change token:', user.emailChangeToken);

  return res.status(202).json({ ok: true });
});

// POST /profile/email/confirm (guest ou auth; confirmando via link)
router.post('/email/confirm', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const user = await prisma.user.findFirst({ where: { emailChangeToken: token } });
  if (!user || !user.emailChangeTokenExpires || user.emailChangeTokenExpires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  if (!user.pendingEmail) {
    return res.status(400).json({ error: 'No pending email change' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.pendingEmail,
      pendingEmail: null,
      emailChangeToken: null,
      emailChangeTokenExpires: null,
    },
  });

  return res.status(200).json({ ok: true });
});

module.exports = router;
