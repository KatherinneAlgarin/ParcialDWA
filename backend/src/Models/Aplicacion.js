import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import Usuario from "./Usuario.js";
import Oferta from "./Oferta.js";

const Aplicacion = sequelize.define("Aplicacion", {
  idaplicacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cv: { type: DataTypes.STRING },
  fecha_aplicacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "aplicaciones",
  timestamps: false
});


Usuario.belongsToMany(Oferta, { through: Aplicacion, foreignKey: "idusuario" });
Oferta.belongsToMany(Usuario, { through: Aplicacion, foreignKey: "idoferta" });

export default Aplicacion;
