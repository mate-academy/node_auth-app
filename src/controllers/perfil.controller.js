'use strict';

import { User } from '../models/user';
import bcrypt from 'bcrypt';

export const getPerfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    res.status(200).render('perfil', { user });
  } catch (error) {
    console.error('Não foi possível objeter o usuário', error);
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};

export const patchPerfilEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, senha } = req.body;

    const user = User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    await User.update(
      { email },
      {
        where: {
          id: userId,
        },
      },
    );

    res.status(200).json({ message: 'Alteração feita!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao tentar alterar!' });
  }
};

export const patchPerfilNome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nome } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    await user.update({ nome });

    return res.status(200).json({ message: 'Alteração feita!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao tentar alterar!' });
  }
};
