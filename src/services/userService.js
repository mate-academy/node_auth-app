'use strict';

/**
 * UserService — Camada de acesso a dados para o modelo User.
 * Princípio da Responsabilidade Única (SRP): este serviço trata
 * exclusivamente de operações CRUD sobre o modelo User.
 */
const { User } = require('../models/User');

/**
 * Busca um usuário pelo email.
 * @param {string} email
 * @returns {Promise<User|null>}
 */
function findByEmail(email) {
  return User.findOne({ where: { email } });
}

/**
 * Busca um usuário pelo ID.
 * @param {number} id
 * @returns {Promise<User|null>}
 */
function findById(id) {
  return User.findByPk(id);
}

/**
 * Busca um usuário pelo token de ativação.
 * @param {string} activationToken
 * @returns {Promise<User|null>}
 */
function findByActivationToken(activationToken) {
  return User.findOne({ where: { activationToken } });
}

/**
 * Busca um usuário pelo token de reset de senha.
 * @param {string} resetToken
 * @returns {Promise<User|null>}
 */
function findByResetToken(resetToken) {
  return User.findOne({ where: { resetToken } });
}

/**
 * Cria um novo usuário no banco de dados.
 * @param {object} data - Dados do usuário
 * @returns {Promise<User>}
 */
function create(data) {
  return User.create(data);
}

/**
 * Atualiza os dados de um usuário.
 * @param {number} id - ID do usuário
 * @param {object} data - Campos a serem atualizados
 * @returns {Promise<User>}
 */
async function update(id, data) {
  const user = await User.findByPk(id);

  if (!user) {
    return null;
  }

  Object.assign(user, data);
  await user.save();

  return user;
}

/**
 * Busca um usuário por um ID de provedor OAuth.
 * @param {string} provider - Nome do provedor (google, facebook, github)
 * @param {string} providerId - ID do provedor
 * @returns {Promise<User|null>}
 */
function findByProviderId(provider, providerId) {
  const fieldMap = {
    google: 'googleId',
    facebook: 'facebookId',
    github: 'githubId',
  };

  const field = fieldMap[provider];

  if (!field) {
    return null;
  }

  return User.findOne({ where: { [field]: providerId } });
}

module.exports = {
  findByEmail,
  findById,
  findByActivationToken,
  findByResetToken,
  create,
  update,
  findByProviderId,
};
