'use strict';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const getLogin = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
    });

    return res.redirect('/perfil');
  } catch (error) {
    console.error('Falha ao tentar logar', error);
    res.status(500).send('Erro interno do servidor.');
  }
};
