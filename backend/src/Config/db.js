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
      connectTimeout: 10000, // 10 segundos
      timezone: 'Etc/GMT-6',
    }
  }
);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a MariaDB con Sequelize!");
  } catch (err) {
    console.error("❌ Error de conexión con Sequelize:", err);
  }
})();

export default sequelize;
