'use strict';

/**
 * TokenService — Gerencia tokens de acesso e refresh.
 * Tokens agora são stateless (apenas validação de assinatura JWT)
 * para sobreviver a reinicializações do servidor.
 *
 * Responsabilidades:
 * - Gerar access tokens (curta duração)
 * - Gerar refresh tokens (longa duração)
 * - Validar tokens
 */
const jwtService = require('./jwtService');

require('dotenv').config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

/**
 * Gera um access token para o usuário.
 * @param {object} user - Instância do User (com id e email)
 * @returns {string} Access token JWT
 */
function generateAccessToken(user) {
  return jwtService.sign({ id: user.id, email: user.email }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRATION,
  });
}

/**
 * Gera um refresh token para o usuário e o armazena.
 * @param {object} user - Instância do User
 * @returns {string} Refresh token JWT
 */
function generateRefreshToken(user) {
  const token = jwtService.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRATION },
  );

  return token;
}

/**
 * Valida um access token.
 * @param {string} token
 * @returns {object|null} Payload decodificado ou null
 */
function validateAccessToken(token) {
  return jwtService.verify(token, ACCESS_SECRET);
}

/**
 * Valida um refresh token.
 * @param {string} token
 * @returns {object|null} Payload decodificado ou null
 */
function validateRefreshToken(token) {
  const payload = jwtService.verify(token, REFRESH_SECRET);

  if (!payload) {
    return null;
  }

  return payload;
}

/**
 * Remove o refresh token de um usuário (logout).
 * Atualmente não necessita ação (stateless).
 * @param {number} userId
 */
function removeRefreshToken(userId) {
  // Em um sistema stateless puro, o token expira naturalmente.
  // Apenas apagamos o cookie no frontend na controller.
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
  removeRefreshToken,
};
