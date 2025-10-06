// src/Models/Oferta.js
import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Oferta = sequelize.define("Oferta", {
  idoferta: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  titulo: { 
    type: DataTypes.STRING(150), 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  rubro: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  salario_minimo: { 
    type: DataTypes.DOUBLE 
  },
  salario_maximo: { 
    type: DataTypes.DOUBLE 
  },
  tipo_salario: { 
    type: DataTypes.ENUM("Quincenal", "Mensual"), 
    allowNull: false 
  },
  tipo_contrato: { 
    type: DataTypes.STRING(50), 
    allowNull: false 
  },
  educacion: { 
    type: DataTypes.STRING(100) 
  },
  experiencia: { 
    type: DataTypes.STRING(100) 
  },
  responsabilidades: { 
    type: DataTypes.TEXT 
  },
  cantidad_plazas: { 
    type: DataTypes.INTEGER, 
    defaultValue: 1 
  },
  cantidad_aplicantes: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  // FK a Empresa 
  idempresa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'empresas',
      key: 'idempresa'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: "ofertas",
  timestamps: false 
});

export default Oferta;