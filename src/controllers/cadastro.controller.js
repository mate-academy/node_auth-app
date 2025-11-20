'use strict';
import { verificacaoSenhaEmail } from '../utils/verificacaoSenhaEmail.js';
import { User } from '../models/user.js';
import { enviarEmail } from '../service/email.service.js';
import jwt from 'jsonwebtoken';

export const postCadastro = async (req, res) => {
  const { email, senha } = req.body;

  const emailError = verificacaoSenhaEmail.email(email);
  if (emailError) {
    return res.status(emailError.status).json({ message: emailError.message });
  }

  const senhaError = verificacaoSenhaEmail.senha(senha);
  if (senhaError) {
    return res.status(senhaError.status).json({ message: senhaError.message });
  }

  const novoUsuario = await User.create({ email, senha });

  const tokenDeVerificacao = jwt.sign(
    { email: novoUsuario.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );

  const link = `http://localhost:3000/verificar-email?token=${tokenDeVerificacao}`;

  await enviarEmail({
    para: email,
    assunto: 'Autenticação de usuário',
    texto: `Olá! Seu cadastro foi concluído com sucesso.
Acesse o link para confirmar seu e-mail: ${link}`,
    html: `
      <h1>Seja bem-vindo!</h1>
      <p>Seu cadastro foi concluído com sucesso.</p>
      <p>Clique no link abaixo para confirmar seu e-mail:</p>
      <a href="${link}">Confirmar e-mail</a>
      <p><b>Email:</b> ${email}</p>
    `,
  });

  return res.status(201).json({
    message: 'Registrado com sucesso!',
    id: novoUsuario.id,
    email: novoUsuario.email,
  });
};
