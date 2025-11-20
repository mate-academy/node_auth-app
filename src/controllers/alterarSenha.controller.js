'use strict';

import jwt from 'jsonwebtoken';
import { enviarEmail } from '../service/email.service.js';
import { verificacaoSenhaEmail } from '../utils/verificacaoSenhaEmail.js';

export const modificarSenha = async (req, res) => {
  const { email } = req.body;

  if (!email || email.trim() === '') {
    return res.status(400).json({ message: 'O campo e-mail é obrigatório' });
  }

  const emailError = verificacaoSenhaEmail.email(email);
  if (emailError) {
    return res.status(emailError.status).json({ message: emailError.message });
  }

  const tokenDeVerificacao = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const link = `http://localhost:3000/redefinirSenha?token=${tokenDeVerificacao}`;

  await enviarEmail({
    para: email,
    assunto: 'Alterar senha',
    texto: `Clique no link para alterar a senha: ${link}`,
    html: `
      <h1>Clique no link para alterar a senha:</h1>
      <a href="${link}">Confirmar e-mail</a>
      <p><b>Email:</b> ${email}</p>
    `,
  });

  res
    .json({ message: `E-mail de alteração enviado para ${email}` })
    .redirect('/cadastro');
};
