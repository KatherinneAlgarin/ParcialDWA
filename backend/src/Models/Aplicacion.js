import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Aplicacion = sequelize.define("Aplicacion", {
  idaplicacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cv: { type: DataTypes.STRING },
  fecha_aplicacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  cv_path: { type: DataTypes.STRING, allowNull: false, field: 'cv' }, 
  carta_presentacion: { type: DataTypes.TEXT, allowNull: true },
  estado: {
    type: DataTypes.ENUM('Activa', 'En revisión', 'Aceptada', 'Rechazada'),
    allowNull: false,
    defaultValue: 'Activa' 
  }
}, {
  tableName: "aplicaciones",
  timestamps: false
});

export default Aplicacion;