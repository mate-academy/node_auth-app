'use strict';

/**
 * Modelo Expense — representa uma despesa financeira.
 *
 * Campos:
 * - id: identificador auto-incrementável (PK)
 * - userId: ID do usuário dono da despesa (FK)
 * - spentAt: data em que a despesa foi realizada
 * - title: descrição curta da despesa
 * - amount: valor em centavos (ex: 15000 = R$ 150,00)
 * - category: nome da categoria (opcional)
 * - note: observação adicional (opcional)
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../setup');

const Expense = sequelize.define(
  'Expense',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    spentAt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'expenses',
    timestamps: false,
  },
);

module.exports = { Expense };
