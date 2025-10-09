/* eslint-disable no-console */
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { hashPassword, comparePasswords } from '../utils/password.js';
import { sendEmail } from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-123456';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'A senha deve ter pelo menos 8 caracteres',
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Já existe um usuário com este e-mail.' });
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      name,
      email,
      passwordHash,
      isActivated: false,
    });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

    const activationLink = `${BACKEND_URL}/api/auth/activate/${token}`;

    await sendEmail({
      to: email,
      subject: 'Ativação de conta',
      html: `
        <p>Obrigado por se registrar!</p>
        <p>Para ativar sua conta, siga este link:</p>
        <a href="${activationLink}">${activationLink}</a>
      `,
    });

    return res.status(201).json({
      message: 'Usuário criado! Verifique seu e-mail para ativar sua conta.',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: 'Erro do servidor' });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Token de ativação ausente' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (user.isActivated) {
      return res.status(400).json({ message: 'Conta já ativada' });
    }

    user.isActivated = true;
    await user.save();

    return res.redirect(`${FRONTEND_URL}/profile`);
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: 'Token inválido ou expirado' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'E-mail e senha são obrigatórios.',
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'E-mail ou senha incorretos' });
    }

    if (!user.isActivated) {
      return res
        .status(403)
        .json({ message: 'Por favor, ative sua conta por e-mail.' });
    }

    const isMatch = await comparePasswords(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'E-mail ou senha incorretos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ token, message: 'Login efetuado com sucesso' });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({ message: 'Erro do servidor' });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  // eslint-disable-next-line no-shadow
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({
        message: 'Se o usuário existir, o e-mail foi enviado.',
      });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    const resetLink = `${BACKEND_URL}/api/auth/reset-password/${token}`;

    console.log(`http://localhost:3000/reset-password/${token}`);

    await sendEmail({
      to: email,
      subject: 'Redefinição de senha',
      html: `
        <p>Para redefinir sua senha, siga este link:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Se você não fez essa solicitação, simplesmente ignore o e-mail.</p>
      `,
    });

    res.json({ message: 'Se o usuário existir, o e-mail foi enviado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro do servidor' });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'As senhas não correspondem.' });
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: 'A senha deve ter pelo menos 8 caracteres',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.passwordHash = hashedPassword;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: 'Token inválido ou expirado' });
  }
};
