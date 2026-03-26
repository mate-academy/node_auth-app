'use strict';

/**
 * AuthService — Orquestra a lógica de negócio de autenticação.
 * Princípio da Responsabilidade Única (SRP): só lida com fluxos de auth.
 * Princípio Aberto/Fechado (OCP): novos métodos de auth podem ser
 * adicionados sem modificar os existentes.
 */
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const userService = require('./userService');
const tokenService = require('./tokenService');
const emailService = require('./emailService');
const { validatePassword } = require('../utils/validatePassword');
const { ApiError } = require('../utils/ApiError');

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1;

/**
 * Registra um novo usuário.
 * - Valida as regras da senha
 * - Verifica se o email já existe
 * - Cria o hash da senha
 * - Gera token de ativação
 * - Envia email de ativação
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Dados do usuário criado (sem senha)
 */
async function register(name, email, password) {
  // Valida as regras da senha
  const passwordErrors = validatePassword(password);

  if (passwordErrors.length > 0) {
    throw ApiError.badRequest('Senha inválida', { password: passwordErrors });
  }

  // Verifica se o email já está em uso
  const existingUser = await userService.findByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('Este email já está em uso');
  }

  // Cria o hash da senha e o token de ativação
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const activationToken = uuidv4();

  // Cria o usuário no banco
  const user = await userService.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
    isActive: false,
  });

  // Envia email de ativação
  await emailService.sendActivationEmail(email, activationToken);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  };
}

/**
 * Ativa a conta de um usuário via token de ativação.
 * @param {string} activationToken
 * @returns {Promise<object>} Dados do usuário ativado
 */
async function activate(activationToken) {
  const user = await userService.findByActivationToken(activationToken);

  if (!user) {
    throw ApiError.notFound('Token de ativação inválido');
  }

  if (user.isActive) {
    throw ApiError.badRequest('Esta conta já está ativa');
  }

  await userService.update(user.id, {
    isActive: true,
    activationToken: null, // Remove o token após ativação
  });

  // Gera tokens para login automático após ativação
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

/**
 * Realiza o login do usuário.
 * - Verifica se o email existe
 * - Verifica se a conta está ativa
 * - Compara a senha
 * - Gera os tokens
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Tokens de acesso e dados do usuário
 */
async function login(email, password) {
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Email ou senha incorretos');
  }

  // Verifica se o usuário tem senha (pode ser conta OAuth)
  if (!user.password) {
    throw ApiError.badRequest(
      'Esta conta foi criada via rede social. Use o login social.',
    );
  }

  // Verifica se a conta está ativa
  if (!user.isActive) {
    throw ApiError.forbidden(
      'Sua conta não está ativa. Verifique seu email para ativá-la.',
    );
  }

  // Compara a senha
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Email ou senha incorretos');
  }

  // Gera os tokens
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
}

/**
 * Realiza o logout do usuário (remove refresh token).
 * @param {number} userId
 */
function logout(userId) {
  tokenService.removeRefreshToken(userId);
}

/**
 * Renova o access token usando o refresh token.
 * @param {string} refreshToken
 * @returns {object} Novo access token e refresh token
 */
async function refresh(refreshToken) {
  const payload = tokenService.validateRefreshToken(refreshToken);

  if (!payload) {
    throw ApiError.unauthorized('Refresh token inválido');
  }

  const user = await userService.findById(payload.id);

  if (!user) {
    throw ApiError.unauthorized('Usuário não encontrado');
  }

  const newAccessToken = tokenService.generateAccessToken(user);
  const newRefreshToken = tokenService.generateRefreshToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Solicita a redefinição de senha (envia email com token).
 * @param {string} email
 */
async function requestPasswordReset(email) {
  const user = await userService.findByEmail(email);

  // Não revela se o email existe ou não (segurança)
  if (!user) {
    return;
  }

  const resetToken = uuidv4();
  const resetTokenExpiry = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await userService.update(user.id, { resetToken, resetTokenExpiry });
  await emailService.sendResetPasswordEmail(email, resetToken);
}

/**
 * Confirma a redefinição de senha.
 * @param {string} token - Token de reset
 * @param {string} password - Nova senha
 * @param {string} confirmation - Confirmação da senha
 */
async function confirmPasswordReset(token, password, confirmation) {
  if (password !== confirmation) {
    throw ApiError.badRequest('As senhas não coincidem');
  }

  const passwordErrors = validatePassword(password);

  if (passwordErrors.length > 0) {
    throw ApiError.badRequest('Senha inválida', { password: passwordErrors });
  }

  const user = await userService.findByResetToken(token);

  if (!user) {
    throw ApiError.notFound('Token de redefinição inválido');
  }

  // Verifica se o token expirou
  if (user.resetTokenExpiry < new Date()) {
    throw ApiError.badRequest('Token de redefinição expirado');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await userService.update(user.id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null,
  });
}

module.exports = {
  register,
  activate,
  login,
  logout,
  refresh,
  requestPasswordReset,
  confirmPasswordReset,
};
