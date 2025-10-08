import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Recurso = sequelize.define("Recurso", {
    idrecurso: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    tipoRecurso: { 
        type: DataTypes.STRING(100),
        field: 'tipo_recurso' 
    },
    titulo: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
    descripcion: { 
        type: DataTypes.TEXT 
    },
    link: { 
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            isUrl: true 
        }
    },
    idempresa: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: "recursos",
    timestamps: false 
});

export default Recurso;