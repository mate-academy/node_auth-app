import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import sequelize from '../config/db.connection.js';

const User = sequelize.define(
  'User',
  {
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    tableName: 'users',
    timestamps: false,
    hooks: {
      beforeSave: async (user) => {
        if (user.password && user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  },
);

User.prototype.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toSafeObject = function () {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    isActive: this.isActive,
  };
};

export { User };
