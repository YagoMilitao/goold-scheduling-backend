import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Room extends Model {
  declare id: number;
  declare name: string;
  declare startTime: string;
  declare endTime: string;
  declare slotMinutes: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Room.init(
  {
    
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    startTime: { type: DataTypes.STRING(5), allowNull: false, defaultValue: "08:00" },
    endTime: { type: DataTypes.STRING(5), allowNull: false, defaultValue: "18:00" },
    slotMinutes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 30 }
  },
  { sequelize, tableName: "rooms" }
);
