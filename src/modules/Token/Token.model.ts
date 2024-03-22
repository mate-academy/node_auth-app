import type {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  ModelStatic,
} from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../services/database.js';
import User from '../User/User.model.js';

class Token extends Model<InferAttributes<Token>, InferCreationAttributes<Token>> {
  declare token: string;
  declare userId: ForeignKey<User['id']>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Token.init(
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize },
);

export type TokenModelType = ModelStatic<Token>;
export default Token;
