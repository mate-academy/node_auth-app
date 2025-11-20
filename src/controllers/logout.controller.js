'use strict';

export const getLogout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout realizado com sucesso' });
    res.redirect('/login');
  } catch (error) {
    console.error('Falha ao tentar sair da conta', error);
    res.status(500).send('Erro interno do servidor.');
  }
};
