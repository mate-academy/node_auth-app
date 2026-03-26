'use strict';

/**
 * UserController — Gerencia o perfil do usuário autenticado.
 * Todas as rotas deste controller exigem autenticação (authMiddleware).
 */
const bcrypt = require('bcrypt');
const userService = require('../services/userService');
const emailService = require('../services/emailService');
const { validatePassword } = require('../utils/validatePassword');
const { ApiError } = require('../utils/ApiError');

const SALT_ROUNDS = 10;

/**
 * GET /profile — Retorna os dados do perfil do usuário.
 */
async function getProfile(req, res, next) {
  try {
    const user = await userService.findById(req.user.id);

    if (!user) {
      throw ApiError.notFound('Usuário não encontrado');
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      googleId: !!user.googleId,
      facebookId: !!user.facebookId,
      githubId: !!user.githubId,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /profile/name — Altera o nome do usuário.
 * Body: { name }
 */
async function changeName(req, res, next) {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      throw ApiError.badRequest('O nome é obrigatório');
    }

    const user = await userService.update(req.user.id, { name: name.trim() });

    res.json({
      message: 'Nome atualizado com sucesso',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /profile/password — Altera a senha do usuário.
 * Body: { oldPassword, newPassword, confirmation }
 */
async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword, confirmation } = req.body;

    // Busca o usuário completo (com senha)
    const user = await userService.findById(req.user.id);

    if (!user) {
      throw ApiError.notFound('Usuário não encontrado');
    }

    // Verifica a senha atual
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw ApiError.badRequest('Senha atual incorreta');
    }

    // Verifica se as senhas conferem
    if (newPassword !== confirmation) {
      throw ApiError.badRequest('As senhas não coincidem');
    }

    // Valida as regras da nova senha
    const passwordErrors = validatePassword(newPassword);

    if (passwordErrors.length > 0) {
      throw ApiError.badRequest('Senha inválida', {
        password: passwordErrors,
      });
    }

    // Atualiza a senha
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userService.update(user.id, { password: hashedPassword });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /profile/email — Altera o email do usuário.
 * Body: { password, newEmail }
 * - Requer a senha para confirmar a identidade
 * - Envia notificação para o email anterior
 */
async function changeEmail(req, res, next) {
  try {
    const { password, newEmail } = req.body;

    if (!newEmail) {
      throw ApiError.badRequest('O novo email é obrigatório');
    }

    // Busca o usuário completo
    const user = await userService.findById(req.user.id);

    if (!user) {
      throw ApiError.notFound('Usuário não encontrado');
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Senha incorreta');
    }

    // Verifica se o novo email já está em uso
    const existingUser = await userService.findByEmail(newEmail);

    if (existingUser) {
      throw ApiError.badRequest('Este email já está em uso');
    }

    const oldEmail = user.email;

    // Atualiza o email
    await userService.update(user.id, { email: newEmail });

    // Notifica o email anterior sobre a mudança
    await emailService.sendEmailChangeNotification(oldEmail, newEmail);

    res.json({
      message:
        'Email alterado com sucesso.' +
        ' Uma notificação foi enviada' +
        ' para o email anterior.',
      user: { id: user.id, name: user.name, email: newEmail },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};
