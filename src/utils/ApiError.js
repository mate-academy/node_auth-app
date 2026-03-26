'use strict';

/**
 * Classe de erro customizada para a API.
 * Permite definir status HTTP e mensagens de erro estruturadas.
 * Segue o princípio Open/Closed — pode ser estendida sem modificar.
 */
class ApiError extends Error {
  /**
   * @param {number} status - Código HTTP do erro
   * @param {string} message - Mensagem principal do erro
   * @param {object} errors - Detalhes adicionais dos erros (ex: validação)
   */
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  // Métodos estáticos para erros comuns (Factory Methods)

  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Não autorizado') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Acesso proibido') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso não encontrado') {
    return new ApiError(404, message);
  }
}

module.exports = { ApiError };
