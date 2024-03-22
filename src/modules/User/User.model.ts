import { DataTypes, Model } from 'sequelize';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ModelStatic,
} from 'sequelize';
import sequelize from '../../services/database.js';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare password: string;
  declare name: string;
  declare activationToken: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      validate: { len: [3, 40] },
    },
    activationToken: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize },
);

export type UserModelType = ModelStatic<User>;
export default User;
