import dotenv from "dotenv";
import { Secret, SignOptions } from "jsonwebtoken";

dotenv.config();

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),

  db: {
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT ?? 3306),
    name: required("DB_NAME"),
    user: required("DB_USER"),
    pass: required("DB_PASS")
  },

  jwt: {
    secret: required("JWT_SECRET") as Secret,
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"]
  }
};