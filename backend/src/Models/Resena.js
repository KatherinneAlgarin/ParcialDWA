// backend/src/Models/Resena.js
import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Resena = sequelize.define("Resena", {
  idcalificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  calificacion: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
  comentario: { type: DataTypes.TEXT, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "resenas",
  timestamps: false
});
 
export default Resena;