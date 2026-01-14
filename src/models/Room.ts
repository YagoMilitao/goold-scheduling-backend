import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Room extends Model {
  declare id: number;
  declare name: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Room.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true }
  },
  { sequelize, tableName: "rooms" }
);
