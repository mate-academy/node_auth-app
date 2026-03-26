'use strict';

/**
 * AuthMiddleware — Protege rotas que exigem autenticação.
 * Verifica o access token no cookie e anexa o usuário à requisição.
 */
const tokenService = require('../services/tokenService');
const { ApiError } = require('../utils/ApiError');

function authMiddleware(req, res, next) {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw ApiError.unauthorized('Token de acesso não fornecido');
    }

    const payload = tokenService.validateAccessToken(accessToken);

    if (!payload) {
      throw ApiError.unauthorized('Token de acesso inválido ou expirado');
    }

    // Anexa os dados do usuário à requisição
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authMiddleware };
