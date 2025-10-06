// src/Models/Empresa.js
import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Empresa = sequelize.define("Empresa", {
  idempresa: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  nombre: { 
    type: DataTypes.STRING(150), 
    allowNull: false 
  },
  direccion: { 
    type: DataTypes.STRING 
  },
  logo: { 
    type: DataTypes.STRING 
  },
  descripcion: { 
    type: DataTypes.STRING 
  },
  redesSociales: { 
    type: DataTypes.STRING 
  },
}, {
  tableName: "empresas",
  timestamps: false 
});
export default Empresa;