import { Table, Column, Model, DataType, HasOne } from 'sequelize-typescript';
import { Token } from './Token';

@Table
export class User extends Model {
  @Column(DataType.STRING)
  name!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  email!: string;

  @Column(DataType.STRING)
  password!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isActive!: boolean;

  @Column(DataType.STRING)
  activationToken?: string | null;

  @Column(DataType.STRING)
  resetToken?: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pendingEmail!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emailChangeToken!: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  emailChangeTokenExpires!: Date | null;

  @HasOne(() => Token)
  token!: Token;
}
