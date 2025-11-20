import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

export const enviarEmail = async ({ para, assunto, texto, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Minha Aplicação" <${process.env.EMAIL_USER}>`,
      to: para,
      subject: assunto,
      text: texto,
      html: html,
    });

    console.log('Email enviado:', info.messageId);
    return { sucesso: true, id: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { sucesso: false, erro: error };
  }
};
