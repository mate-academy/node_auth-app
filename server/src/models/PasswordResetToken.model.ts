'use strict';

import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/db.js';

export class ResetPasswordToken extends Model<
  InferAttributes<ResetPasswordToken>,
  InferCreationAttributes<ResetPasswordToken>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare token: string;
  declare usedAt: CreationOptional<Date | null>;
}

ResetPasswordToken.init(
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    usedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'ResetPasswordToken',
    updatedAt: false,
  },
);
