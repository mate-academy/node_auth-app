'use strict';

/**
 * JwtService — Wrappers de baixo nível para jsonwebtoken.
 * Princípio da Inversão de Dependência (DIP): isola a biblioteca
 * jsonwebtoken, facilitando a troca de implementação no futuro.
 */
const jwt = require('jsonwebtoken');

/**
 * Assina um payload e retorna o token JWT.
 * @param {object} payload - Dados a serem codificados no token
 * @param {string} secret - Chave secreta para assinar
 * @param {object} options - Opções do JWT (ex: expiresIn)
 * @returns {string} Token JWT
 */
function sign(payload, secret, options = {}) {
  return jwt.sign(payload, secret, options);
}

/**
 * Verifica um token JWT e retorna o payload decodificado.
 * @param {string} token - Token JWT a ser verificado
 * @param {string} secret - Chave secreta para verificar
 * @returns {object|null} Payload decodificado ou null se inválido
 */
function verify(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

module.exports = { sign, verify };
