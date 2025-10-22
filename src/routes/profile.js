// src/routes/profile.js
const { Router } = require('express');
const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const auth = require('../middleware/auth');
const { sendEmailChangeNotice } = require('../services/email');
<<<<<<< HEAD
// password rules: at least 8 chars, 1 uppercase, 1 number
function isStrongPassword(pw) {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
}

=======
const { isStrongPassword, isValidEmail } = require('../utils/validators');
>>>>>>> 0fe3a41 (fix: migrations, auth flows, email, middlewares, 404_V2)

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
  if (!name) return res.status(400).json({ error: 'name required' });
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

  if (!isStrongPassword(newPassword)) return res.status(400).json({ error: 'Password does not meet rules' });
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return res.json({ ok: true });
});

// ✅ PATCH /profile/email (auth-only; inicia verificação + notifica e-mail antigo)
<<<<<<< HEAD
router.patch('/email', auth, async (req, res) => { const { newEmail, currentPassword } = req.body;
=======
router.patch('/email', auth, async (req, res) => { const { newEmail, confirmEmail, currentPassword } = req.body;
>>>>>>> 0fe3a41 (fix: migrations, auth flows, email, middlewares, 404_V2)
  if (!newEmail) return res.status(400).json({ error: 'newEmail required' });

  const emailChangeToken = randomBytes(32).toString('hex');
  const emailChangeTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { pendingEmail: newEmail, emailChangeToken, emailChangeTokenExpires },
    select: { id: true, email: true, pendingEmail: true, emailChangeToken: true }
  });

  // Notifica o e-mail antigo (obrigatório no review). Se NO_EMAIL=1, vira log.
  try {
    await sendEmailChangeNotice(user.email, user.pendingEmail);
  } catch (e) {
    console.error('sendEmailChangeNotice failed:', e.message);
  }

  // Envio do link de verificação p/ o novo e-mail: se você quiser enviar de fato,
  // crie uma função sendEmailChangeVerification. Por enquanto, logamos o link:
  console.log('Email change token:', user.emailChangeToken);

  return res.status(202).json({ ok: true });
});

// ✅ POST /profile/email/confirm (confirma via token)
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
