const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { registrationSchema } = require('../utils/validators');
const { sendActivationEmail } = require('../services/email');
const {
  signAccessToken,
  signRefreshToken,
  saveRefreshToken,
  removeRefreshToken,
  findRefreshToken,
  verifyRefreshToken,
} = require('../services/tokenService');

const prisma = new PrismaClient();

function normalizeUser(u) {
  return { id: u.id, email: u.email, name: u.name, isActive: u.isActive };
}

const isProd = process.env.NODE_ENV === 'production';

// POST /auth/registration
async function registration(req, res) {
  try {
    const parsed = registrationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Dados inválidos', issues: parsed.error.issues });
    }
    const { email, password, name } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: { email, passwordHash, name, activationToken },
    });

    const activationLink = `${process.env.CLIENT_URL}/activate/${encodeURIComponent(email)}/${activationToken}`;

<<<<<<< HEAD
    await sendActivationEmail(email, token);
=======
    await sendActivationEmail(email, activationToken);
>>>>>>> 0fe3a41 (fix: migrations, auth flows, email, middlewares, 404_V2)

    return res.status(201).json({
      message: 'Usuário criado. Verifique seu e-mail para ativar a conta.',
      user: normalizeUser(user),
    });
  } catch (err) {
    console.error('[registration] error', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

// GET /auth/activation/:email/:token
async function activation(req, res) {
  try {
    const { email, token } = req.params;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.activationToken) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    if (user.activationToken !== token) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true, activationToken: null },
    });

    const payload = { sub: updated.id, email: updated.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await saveRefreshToken(updated.id, refreshToken, expiresAt);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: normalizeUser(updated), accessToken, message: 'Conta ativada com sucesso' });
  } catch (err) {
    console.error('[activation] error', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

// POST /auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    if (!user.isActive) return res.status(403).json({ error: 'Conta ainda não ativada' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    const payload = { sub: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await saveRefreshToken(user.id, refreshToken, expiresAt);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: normalizeUser(user), accessToken });
  } catch (err) {
    console.error('[login] error', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

// GET /auth/refresh
async function refresh(req, res) {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;
    if (!tokenFromCookie) return res.status(401).json({ error: 'Sem refresh token' });

    const payload = verifyRefreshToken(tokenFromCookie);
    const stored = await findRefreshToken(tokenFromCookie);
    if (!stored || stored.userId !== payload.sub) {
      return res.status(401).json({ error: 'Refresh inválido' });
    }

    const newPayload = { sub: payload.sub, email: payload.email };
    const accessToken = signAccessToken(newPayload);
    const newRefresh = signRefreshToken(newPayload);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await removeRefreshToken(tokenFromCookie);
    await saveRefreshToken(payload.sub, newRefresh, expiresAt);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch (err) {
    console.error('[refresh] error', err);
    return res.status(401).json({ error: 'Refresh inválido/expirado' });
  }
}

// POST /auth/logout
async function logout(req, res) {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;
    if (tokenFromCookie) {
      await removeRefreshToken(tokenFromCookie);
    }
    res.clearCookie('refreshToken', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
    return res.json({ message: 'Logout feito' });
  } catch (err) {
    console.error('[logout] error', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

// GET /auth/me
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    return res.json(normalizeUser(user));
  } catch (err) {
    console.error('[me] error', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

module.exports = {
  registration,
  activation,
  login,
  refresh,
  logout,
  me,
};
