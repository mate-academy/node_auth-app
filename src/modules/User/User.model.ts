import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, ModelStatic } from 'sequelize';
import sequelize from '../../services/database.js';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare email: string;
  declare password: string;
  declare name: string;
  declare activationToken: string | null;
}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [8, 100] },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [3, 20] },
    },
    activationToken: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
  },
  { sequelize },
);

export type UserModelType = ModelStatic<User>;
export default User;
