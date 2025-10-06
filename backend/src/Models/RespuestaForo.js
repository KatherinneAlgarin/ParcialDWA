import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import Foro from "./Foro.js";
import Usuario from "./Usuario.js";

const RespuestaForo = sequelize.define("RespuestaForo", {
  idrespuesta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contenido: { type: DataTypes.TEXT, allowNull: false },
  fecha_respuesta: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "respuestas_foro",
  timestamps: false
});

RespuestaForo.belongsTo(Foro, { foreignKey: "idforo" });
Foro.hasMany(RespuestaForo, { foreignKey: "idforo" });

RespuestaForo.belongsTo(Usuario, { foreignKey: "idusuario" });
Usuario.hasMany(RespuestaForo, { foreignKey: "idusuario" });

export default RespuestaForo;
