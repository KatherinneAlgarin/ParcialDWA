import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const RespuestaForo = sequelize.define("RespuestaForo", {
  idrespuesta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contenido: { type: DataTypes.TEXT, allowNull: false },
  fecha_respuesta: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true, 
    references: {
      model: 'respuestas_foro', 
      key: 'idrespuesta'
    }
  }
}, {
  tableName: "respuestas_foro",
  timestamps: false
});

export default RespuestaForo;