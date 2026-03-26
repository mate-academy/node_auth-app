'use strict';

const expensesService = require('../services/expenses.service');
const usersService = require('../services/userService');

// Controlador para listar todas as despesas
// (com suporte a filtros via req.query)
const getAll = async (req, res) => {
  // Express 5: req.query é imutável (getter que re-parseia a URL).
  // Por isso, criamos um novo objeto de filtros explicitamente.
  const filters = { ...req.query, userId: req.user.id };

  const filtered = await expensesService.getAll(filters);

  res.status(200).json(filtered);
};

// Controlador para buscar uma despesa específica pelo ID
const getById = async (req, res) => {
  const id = Number(req.params.id);
  const expense = await expensesService.getById(id, req.user.id);

  if (!expense) {
    return res.status(404).json({ message: 'Despesa não encontrada' });
  }

  res.status(200).json(expense);
};

// Controlador para cadastrar uma nova despesa
const create = async (req, res) => {
  const { spentAt, title, amount } = req.body;
  const userId = req.user.id;

  // Validação: campos obrigatórios
  if (!spentAt || !title || !amount) {
    return res
      .status(400)
      .json({ message: 'Todos os campos são obrigatórios' });
  }

  // Verifica se o usuário informado realmente existe no banco
  const userExists = await usersService.findById(userId);

  if (!userExists) {
    return res.status(400).json({ message: 'Usuário não encontrado' });
  }

  // Cria a despesa
  const newExpense = await expensesService.create({ ...req.body, userId });

  res.status(201).json(newExpense);
};

// Controlador para atualizar os dados de uma despesa
const update = async (req, res) => {
  const id = Number(req.params.id);
  const expense = await expensesService.update(id, req.user.id, req.body);

  if (!expense) {
    return res.status(404).json({ message: 'Despesa não encontrada' });
  }

  res.status(200).json(expense);
};

// Controlador para remover uma despesa
const remove = async (req, res) => {
  const id = Number(req.params.id);
  const removed = await expensesService.remove(id, req.user.id);

  if (!removed) {
    return res.status(404).json({ message: 'Despesa não encontrada' });
  }

  // Retorna status de sucesso sem conteúdo
  res.sendStatus(204);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
