import { Sequelize } from "sequelize";
import { env } from "./env";

console.log("DB CONFIG =>", env.db);

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user, 
  env.db.pass,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "mysql",
    logging: false
  }
);
