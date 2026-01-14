import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export type BookingStatus = "EM_ANALISE" | "AGENDADO" | "CANCELADO";

export class Booking extends Model {
  declare id: number;
  declare scheduledAt: Date;
  declare status: BookingStatus;
  declare createdByRole: "ADMIN" | "CLIENT";
  declare userId: number;
  declare roomId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Booking.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    scheduledAt: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("EM_ANALISE", "AGENDADO", "CANCELADO"),
      allowNull: false,
      defaultValue: "EM_ANALISE"
    },
    createdByRole: { type: DataTypes.ENUM("ADMIN", "CLIENT"), allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    roomId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  },
  { sequelize, tableName: "bookings" }
);
