// src/Models/Usuario.js
import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Usuario = sequelize.define("Usuario", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    },
  },
  password: {   
    type: DataTypes.STRING(255), 
    allowNull: false, 
    field: "contraseña", 
  },
  foto_perfil: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  curriculum_path: {
    type: DataTypes.STRING(255),
    allowNull: true, 
    defaultValue: null,
  },
  rol: {
    type: DataTypes.ENUM("Empleador", "Candidato"),
    allowNull: false,
  },
  direccion: { 
    type: DataTypes.STRING 
  },
  nacionalidad: { 
    type: DataTypes.STRING 
  },
  biografia: { 
    type: DataTypes.TEXT 
  },
  educacion: { 
    type: DataTypes.TEXT 
  },
  telefono: { 
    type: DataTypes.STRING(20) 
  },
  experiencia: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  redes_sociales: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  estado_civil: {
    type: DataTypes.ENUM("Casado", "Soltero", "Viudo"),
    allowNull: true,
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true, 
  },
  idempresa: {
    type: DataTypes.INTEGER,
    allowNull: true, 
    references: {
      model: 'empresas',
      key: 'idempresa'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL' 
  }
}, {
  tableName: "usuarios",
  timestamps: false,
});

export default Usuario;