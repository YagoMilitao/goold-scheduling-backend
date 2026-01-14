import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class User extends Model {
  declare id: number;
  declare name: string;
  declare lastName: string | null;
  declare email: string;
  declare passwordHash: string;
  declare role: "ADMIN" | "CLIENT";
  declare cep: string | null;
  declare address: string | null;
  declare number: string | null;
  declare complement: string | null;
  declare neighborhood: string | null;
  declare city: string | null;
  declare state: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    lastName: { type: DataTypes.STRING(120), allowNull: true },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM("ADMIN", "CLIENT"), allowNull: false },

    cep: { type: DataTypes.STRING(9), allowNull: true },
    address: { type: DataTypes.STRING(180), allowNull: true },
    number: { type: DataTypes.STRING(20), allowNull: true },
    complement: { type: DataTypes.STRING(80), allowNull: true },
    neighborhood: { type: DataTypes.STRING(120), allowNull: true },
    city: { type: DataTypes.STRING(120), allowNull: true },
    state: { type: DataTypes.STRING(120), allowNull: true }
  },
  { sequelize, tableName: "users" }
);
