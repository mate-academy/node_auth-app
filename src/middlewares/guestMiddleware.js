'use strict';

/**
 * GuestMiddleware — Protege rotas que devem ser acessadas
 * apenas por usuários NÃO autenticados (ex: login, registro).
 * Retorna 403 se o usuário já estiver logado.
 */
const tokenService = require('../services/tokenService');
const { ApiError } = require('../utils/ApiError');

function guestMiddleware(req, res, next) {
  try {
    const { accessToken } = req.cookies;

    if (accessToken) {
      const payload = tokenService.validateAccessToken(accessToken);

      if (payload) {
        throw ApiError.forbidden(
          'Você já está autenticado. Faça logout primeiro.',
        );
      }
    }

    // Usuário não autenticado — pode prosseguir
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { guestMiddleware };
