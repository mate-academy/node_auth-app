'use strict';

/**
 * Modelo Category — representa uma categoria personalizada.
 *
 * Campos:
 * - id: identificador auto-incrementável (PK)
 * - userId: ID do usuário dono da categoria (FK)
 * - name: nome da categoria (ex: "Alimentação", "Transporte")
 *
 * Isolamento: cada usuário só vê e gerencia suas próprias categorias.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../setup');

const Category = sequelize.define(
  'Category',
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'categories',
    timestamps: false,
  },
);

module.exports = { Category };
