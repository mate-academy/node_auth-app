'use strict';

/**
 * ErrorMiddleware — Tratamento global de erros.
 * Captura instâncias de ApiError e retorna respostas JSON padronizadas.
 * Erros inesperados recebem status 500.
 */
const { ApiError } = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
  }

  // Erro inesperado — loga e retorna 500
  // eslint-disable-next-line no-console
  console.error('Erro inesperado:', err);

  return res.status(500).json({
    message: 'Erro interno do servidor',
  });
}

module.exports = { errorMiddleware };
