import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export type UserRole = "ADMIN" | "CLIENT";

export class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM("ADMIN", "CLIENT"), allowNull: false, defaultValue: "CLIENT" }
  },
  {
    sequelize,
    tableName: "users"
  }
);
