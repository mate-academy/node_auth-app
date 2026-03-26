'use strict';

const { Category } = require('../models/Category');

// Retorna todas as categorias do usuário autenticado
async function getAll(userId) {
  return Category.findAll({ where: { userId } });
}

// Busca uma categoria específica pelo ID, somente se pertencer ao usuário
async function getById(id, userId) {
  return Category.findOne({ where: { id, userId } });
}

// Cria uma nova categoria vinculada ao usuário autenticado
async function create(data) {
  return Category.create(data);
}

// Atualiza os dados de uma categoria do usuário autenticado
async function update(id, userId, data) {
  const category = await getById(id, userId);

  // Retorna null caso a categoria não pertença ao usuário
  if (!category) {
    return null;
  }

  // Salva as alterações no banco de dados
  await category.update(data);

  return category;
}

// Remove uma categoria pelo ID, somente se pertencer ao usuário
async function remove(id, userId) {
  const category = await getById(id, userId);

  if (!category) {
    return false;
  }

  // Deleta o registro definitivamente
  await category.destroy();

  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
