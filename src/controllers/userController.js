import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { v4 as uuidv4 } from 'uuid';

export const updateUserName = async (req, res) => {
  const { name } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user.name = name;
    await user.save();

    res.json({ message: 'Nome atualizado', name });
  } catch (error) {
    res.status(500).json({ message: 'Erro do servidor' });
  }
};

export const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'A senha atual está incorreta.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hash;
    await user.save();

    res.json({ message: 'Senha atualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Erro do servidor' });
  }
};

export const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    const token = uuidv4();

    user.emailChangeToken = token;
    user.newEmail = newEmail;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Alterar e-mail',
      html: `<p>Alguém está tentando alterar seu e-mail para ${newEmail}. Se não for você, não faça nada. Se for você, confirme a alteração seguindo <a href="http://localhost:5000/api/user/confirm-email-change/${token}">este link</a>.</p>`,
    });

    res.json({
      message:
        'Um e-mail de confirmação foi' +
        'enviado para seu endereço de e-mail antigo.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro do servidor' });
  }
};

export const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ where: { emailChangeToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido' });
    }
    user.email = user.newEmail;
    user.newEmail = null;
    user.emailChangeToken = null;
    await user.save();

    res.redirect('/email-changed-success.html');
  } catch (error) {
    res.status(500).json({ message: 'Erro do servidor' });
  }
};
