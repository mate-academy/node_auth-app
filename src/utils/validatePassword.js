'use strict';

/**
 * Valida a senha do usuário com base em regras de segurança.
 * Retorna um array com as violações encontradas.
 *
 * Regras:
 * - Mínimo de 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um dígito numérico
 * - Pelo menos um caractere especial (!@#$%^&*()_+-=)
 *
 * @param {string} password - A senha a ser validada
 * @returns {string[]} Array de mensagens de erro
 *   (vazio se a senha for válida)
 */
function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  if (!/[^a-zA-Z0-9\s]/.test(password)) {
    errors.push(
      'A senha deve conter pelo menos um caractere especial (!@#$., etc)',
    );
  }

  return errors;
}

module.exports = { validatePassword };
