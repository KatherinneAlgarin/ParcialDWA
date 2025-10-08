// backend/src/Models/associations.js
import Usuario from './Usuario.js';
import Empresa from './Empresa.js';
import Oferta from './Oferta.js';
import Aplicacion from './Aplicacion.js';
import Foro from './Foro.js';
import Resena from './Resena.js';
import RespuestaForo from './RespuestaForo.js';
import Recurso from './Recurso.js';
console.log("Cargando asociaciones entre modelos...");

// --- Relaciones de Usuario ---
Usuario.hasMany(Foro, { foreignKey: "idusuario" });
Usuario.hasMany(Resena, { foreignKey: "idusuario" });
Usuario.hasMany(RespuestaForo, { foreignKey: "idusuario" });
Usuario.belongsTo(Empresa, { foreignKey: 'idempresa' });

// --- Relaciones de Empresa ---
Empresa.hasMany(Oferta, { foreignKey: 'idempresa' });
Empresa.hasMany(Resena, { foreignKey: "idempresa" });
Empresa.hasMany(Usuario, { foreignKey: 'idempresa' });
Empresa.hasMany(Recurso, { foreignKey: 'idempresa', onDelete: 'CASCADE' });
// --- Relaciones de Oferta ---
Oferta.belongsTo(Empresa, { foreignKey: 'idempresa' });

// --- Relaciones de Foro y sus Respuestas ---
Foro.belongsTo(Usuario, { foreignKey: "idusuario" });
Foro.hasMany(RespuestaForo, { foreignKey: "idforo" });
RespuestaForo.belongsTo(Foro, { foreignKey: "idforo" });
RespuestaForo.belongsTo(Usuario, { foreignKey: "idusuario" });

// --- Relaciones de Reseña ---
Resena.belongsTo(Usuario, { foreignKey: "idusuario" });
Resena.belongsTo(Empresa, { foreignKey: "idempresa" });

Recurso.belongsTo(Empresa, { foreignKey: 'idempresa' });


Usuario.hasMany(Aplicacion, { foreignKey: 'idusuario' });
Aplicacion.belongsTo(Usuario, { foreignKey: 'idusuario' });

// Una Oferta tiene muchas Aplicaciones, y cada Aplicación pertenece a una Oferta.
Oferta.hasMany(Aplicacion, { foreignKey: 'idoferta' });
Aplicacion.belongsTo(Oferta, { foreignKey: 'idoferta', as: 'Oferta'});


// --- Relación Muchos a Muchos (definición de alto nivel) ---
Usuario.belongsToMany(Oferta, { through: Aplicacion, foreignKey: "idusuario" });
Oferta.belongsToMany(Usuario, { through: Aplicacion, foreignKey: "idoferta" });

RespuestaForo.hasMany(RespuestaForo, { as: 'Hijas', foreignKey: 'parent_id', useJunctionTable: false, onDelete: 'CASCADE' });
RespuestaForo.belongsTo(RespuestaForo, { as: 'Padre', foreignKey: 'parent_id', useJunctionTable: false });

console.log("✅ Asociaciones cargadas correctamente.");