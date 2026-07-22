'use strict';

const bcrypt = require('bcrypt');
const { DataTypes, Model } = require('sequelize');

const { sequelize } = require('../config/database');

class User extends Model {
  comparePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      isActivated: this.isActivated,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActivated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  },
);

module.exports = { User };
