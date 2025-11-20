'use strict';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.js';

export const verificacaoEmail = async (req, res) => {
  const token = req.query.token;

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ where: { email: dados.email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user.verificado = true;
    await user.save();

    const novoToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', novoToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.redirect('/perfil');
  } catch (error) {
    return res.status(400).json({ message: 'Token inválido ou expirado' });
  }
};
