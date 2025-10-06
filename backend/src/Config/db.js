import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
const sequelize = new Sequelize(
  process.env.DB_NAME,     
  process.env.DB_USER,     
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: "mariadb",
    port: process.env.DB_PORT,
    dialectOptions: {
      connectTimeout: 30000, 
      timezone: 'Etc/GMT-6',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 10000
    }
  }
);


export default sequelize;
