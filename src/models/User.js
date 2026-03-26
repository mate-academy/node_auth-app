'use strict';

/**
 * Modelo User — representa um usuário no sistema.
 *
 * Campos:
 * - name: nome do usuário
 * - email: email único (usado para login)
 * - password: hash bcrypt da senha
 * - activationToken: token UUID para ativação por email
 * - isActive: indica se o usuário confirmou o email
 * - resetToken: token UUID para redefinição de senha
 * - resetTokenExpiry: data de expiração do token de reset
 * - googleId, facebookId, githubId: IDs de provedores OAuth (opcional)
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../setup');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Pode ser null se o login for via OAuth
    },
    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebookId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true, // createdAt / updatedAt automáticos
  },
);

module.exports = { User };
