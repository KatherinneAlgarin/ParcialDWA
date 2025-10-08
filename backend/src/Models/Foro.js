// backend/src/Models/Foro.js
import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Foro = sequelize.define("Foro", {
  idforo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "foros",
  timestamps: false
});

export default Foro;