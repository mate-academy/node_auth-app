// utils/db.js
import { Sequelize } from "sequelize";

const dbUrl = process.env.DATABASE_URL || "postgres://postgres:123123@localhost:5432/postgres";

export const client = new Sequelize(dbUrl, {
  dialect: "postgres",
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production" ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
});