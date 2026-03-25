/* eslint-disable no-console */
const { categoriesService } = require('../services/categories.service');

const getAll = async (req, res) => {
  const userId = req.user.id;
  const categories = await categoriesService.getAll(userId);

  res.json(categories.map(categoriesService.normalize));
};

const getOne = async (req, res) => {
  const category = await categoriesService.getById(req.params.id);

  if (!category) {
    return res.sendStatus(404);
  }

  res.json(categoriesService.normalize(category));
};

const create = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.sendStatus(400);
  }

  const newCategory = await categoriesService.create(name, userId);

  res.status(201).json(newCategory);
};

const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deletedCount = await categoriesService.deleteById(id, userId);

    if (deletedCount === 0) {
      return res.status(403).json({ message: 'Access denied or not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    const categoryExists = await categoriesService.getById(id);

    if (!categoryExists) {
      return res.sendStatus(404);
    }

    if (!name) {
      return res.sendStatus(400);
    }

    const updatedCategory = await categoriesService.update({
      id,
      name,
      userId,
    });

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const categoriesController = {
  getAll,
  getOne,
  create,
  deleteOne,
  update,
};

module.exports = {
  categoriesController,
};
