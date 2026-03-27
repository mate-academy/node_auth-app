const { Category } = require('../models/Category.model');

async function getAll(userId) {
  return Category.findAll({ where: { userId } }); // Фільтруємо по юзеру
}

async function getById(id) {
  return Category.findByPk(id);
}

function normalize({ id, name }) {
  return { id, name };
}

async function create(name, userId) {
  return Category.create({ name, userId }); // Прив'язуємо до юзера
}

// Перевіряємо, чи категорія належить саме цьому юзеру
// перед видаленням/оновленням
async function deleteById(id, userId) {
  return Category.destroy({
    where: { id, userId },
  });
}

async function update({ id, name, userId }) {
  const category = await Category.findOne({
    where: { id, userId },
  });

  if (!category) {
    throw new Error(
      'Категорію не знайдено або у вас немає прав на її редагування',
    );
  }

  return category.update({ name });
}

const categoriesService = {
  getAll,
  getById,
  create,
  deleteById,
  update,
  normalize,
};

module.exports = {
  categoriesService,
};
