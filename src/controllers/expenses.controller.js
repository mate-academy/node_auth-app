/* eslint-disable no-console */
'use strict';

const { expensesService } = require('../services/expenses.service');
// const { Expense } = require('../models/Expense.model');
// const { Category } = require('../models/Category.model');
const { models } = require('../models/models');
const { Expense, Category } = models;

const getAll = async (req, res) => {
  try {
    const userId = req.user.id;

    // Отримуємо всі витрати ТІЛЬКИ поточного користувача
    // Також додаємо дані про категорію для зручності фронтенду
    const expenses = await Expense.findAll({
      where: { userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'], // Беремо тільки потрібні поля категорії
        },
      ],
      order: [['spentAt', 'DESC']], // Свіжі витрати будуть зверху
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get Expenses Error:', error);
    res.status(500).json({ message: 'Помилка при отриманні списку витрат' });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await expensesService.getById(id);

    // Перевіряємо: чи існує витрата і чи належить вона юзеру
    if (!expense || expense.userId !== userId) {
      return res.status(404).json({ message: 'Витрату не знайдено' });
    }

    res.json(expensesService.normalize(expense));
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні витрати' });
  }
};

const create = async (req, res) => {
  try {
    const { title, amount, categoryId, spentAt, note } = req.body;
    const userId = req.user.id;

    // 1. Валідація обов'язкових полів
    if (!title || amount === undefined || !categoryId) {
      return res.status(400).json({
        message: 'Назва, сума та категорія обов’язкові',
      });
    }

    // 2. Перевірка: чи належить категорія цьому користувачу?
    // Це захист від того, щоб користувач не вказав ID чужої категорії
    const category = await Category.findOne({
      where: { id: categoryId, userId },
    });

    if (!category) {
      return res.status(400).json({
        message: 'Категорію не знайдено або вона вам не належить',
      });
    }

    // 3. Створення запису
    const newExpense = await Expense.create({
      title,
      amount: +amount, // Зберігаємо ціле число (копійки/центи)
      categoryId,
      userId: req.user.id,
      spentAt: spentAt || new Date(),
      note: note || '',
    });

    const fullExpense = await Expense.findByPk(newExpense.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.status(201).json(fullExpense);
  } catch (error) {
    console.error('Create Expense Error:', error);
    res.status(500).json({ message: 'Помилка при створенні витрати' });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Видаляємо тільки якщо ID витрати збігається і вона належить юзеру
    const deletedCount = await Expense.destroy({
      where: { id, userId },
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        message: 'Витрату не знайдено або доступ заборонено',
      });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Delete Expense Error:', error);
    res.status(500).json({ message: 'Помилка при видаленні' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Спершу перевіряємо, чи ця витрата взагалі належить цьому юзеру
    const expense = await expensesService.getById(id);

    if (!expense || expense.userId !== userId) {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }

    if (updateData.amount !== undefined) {
      updateData.amount = +updateData.amount;
    }

    // Оновлюємо (передаємо id та дані для оновлення)
    const updatedExpense = await expensesService.update({ id, ...updateData });

    res.json(expensesService.normalize(updatedExpense));
  } catch (error) {
    res.status(500).json({ message: 'Помилка при оновленні витрати' });
  }
};

const expensesController = {
  getAll,
  getOne,
  create,
  deleteOne,
  update,
};

module.exports = {
  expensesController,
};
