const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./User');

const Token = sequelize.define('token', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  token: {
    type: DataTypes.TEXT,
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
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  Token,
};
