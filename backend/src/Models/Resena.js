import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import Usuario from "./Usuario.js";
import Empresa from "./Empresa.js";

const Resena = sequelize.define("Resena", {
  idcalificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  calificacion: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
  comentario: { type: DataTypes.TEXT, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "resenas",
  timestamps: false
});
Resena.belongsTo(Usuario, { foreignKey: "idusuario" });
Usuario.hasMany(Resena, { foreignKey: "idusuario" });

Resena.belongsTo(Empresa, { foreignKey: "idempresa" });
Empresa.hasMany(Resena, { foreignKey: "idempresa" });

export default Resena;
