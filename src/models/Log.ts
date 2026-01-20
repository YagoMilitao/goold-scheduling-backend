import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export const Log = sequelize.define(
  "Log",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    module: {
      type: DataTypes.ENUM("AGENDAMENTOS", "MINHA_CONTA", "LOGS"),
      allowNull: false
    },

    activityType: { type: DataTypes.STRING(120), allowNull: false },

    meta: { type: DataTypes.JSON, allowNull: true }
  },
  {
    tableName: "logs",
    timestamps: true,
    updatedAt: false
  }
);

Log.belongsTo(User, { foreignKey: "userId", as: "user" });
