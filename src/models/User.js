const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Пошта має бути унікальною
      validate: {
        isEmail: true, // Вбудована перевірка на валідність формату email
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Тут буде зберігатися вже захешований пароль
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE, // Час, коли токен для скидання пароля "згорить"
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  },
);

module.exports = User;
