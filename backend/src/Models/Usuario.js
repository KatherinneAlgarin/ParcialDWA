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
  type: DataTypes.STRING(150),
  allowNull: false,
}
}, {
  tableName: "usuarios",
  timestamps: false,
});

export default Usuario;