const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./User');

const Token = sequelize.define('token', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('activation', 'reset', 'email_change', 'refresh'),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

// Налаштування зв'язку (Token належить User)
User.hasMany(Token, { onDelete: 'CASCADE' });
Token.belongsTo(User);

module.exports = {
  Token,
};
