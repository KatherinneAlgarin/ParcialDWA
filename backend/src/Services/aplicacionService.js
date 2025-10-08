import Aplicacion from '../Models/Aplicacion.js';
import Oferta from '../Models/Oferta.js';
import Empresa from '../Models/Empresa.js';
import Usuario from '../Models/Usuario.js';
export const crearAplicacion = async (datosAplicacion) => {
    try {
        const existe = await Aplicacion.findOne({
            where: {
                idusuario: datosAplicacion.idusuario,
                idoferta: datosAplicacion.idoferta
            }
        });

        if (existe) {
            const error = new Error('Ya has aplicado a esta oferta de trabajo.');
            error.statusCode = 409; 
            throw error;
        }
        const nuevaAplicacion = await Aplicacion.create(datosAplicacion);
        await Oferta.increment('cantidad_aplicantes', { where: { idoferta: datosAplicacion.idoferta } });

        return nuevaAplicacion;
    } catch (err) {
        throw err;
    }
};

export const obtenerAplicacionesPorUsuario = async (idusuario) => {
    try {
        const aplicaciones = await Aplicacion.findAll({
            where: { idusuario },
            include: [{
                model: Oferta,
                as: 'Oferta',
                required: true, 
                include: [{ 
                    model: Empresa,
                    required: true,
                    attributes: ['nombre'] 
                }]
            }],
            order: [['fecha_aplicacion', 'DESC']] 
        });
        return aplicaciones;
    } catch (err) {
        console.error("Error en obtenerAplicacionesPorUsuario:", err);
        throw err;
    }
};
export const eliminarAplicacion = async (idaplicacion, idusuario) => {
    try {
        const aplicacion = await Aplicacion.findOne({
            where: { idaplicacion, idusuario }
        });
        if (!aplicacion) {
            const error = new Error('Aplicación no encontrada o no tienes permiso para eliminarla.');
            error.statusCode = 404;
            throw error;
        }
        await aplicacion.destroy();
        await Oferta.decrement('cantidad_aplicantes', { where: { idoferta: aplicacion.idoferta } });
        return true;
    } catch (err) {
        throw err;
    }
};
export const obtenerAplicacionesPorOferta = async (idoferta) => {
    try {
        const aplicaciones = await Aplicacion.findAll({
            where: { idoferta },
            include: [{
                model: Usuario,
                attributes: ['id', 'nombre', 'foto_perfil', 'correo', 'direccion', 'nacionalidad', 'biografia','educacion',
                    'experiencia', 'redes_sociales', 'estado_civil', 'fecha_nacimiento', 'curriculum_path']
            }],
            order: [['fecha_aplicacion', 'ASC']] 
        });
        return aplicaciones;
    } catch (err) {
        throw err;
    }
};

export const actualizarEstadoAplicacion = async (idaplicacion, idempresaUsuario, nuevoEstado) => {
    try {
        const aplicacion = await Aplicacion.findByPk(idaplicacion, {
            include: [{ model: Oferta, as: 'Oferta' }] 
        });

        if (!aplicacion) {
            const error = new Error('Aplicación no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        if (aplicacion.Oferta.idempresa !== idempresaUsuario) {
            const error = new Error('No tienes permisos para modificar esta aplicación.');
            error.statusCode = 403;
            throw error;
        }
        
        aplicacion.estado = nuevoEstado;
        await aplicacion.save();
        return aplicacion;
    } catch (err) {
        throw err;
    }
};
export const obtenerTodasAplicacionesDeEmpresa = async (idempresa) => {
    try {
        const aplicaciones = await Aplicacion.findAll({
            include: [{
                model: Oferta,
                as: 'Oferta',
                where: { idempresa }, 
                attributes: ['titulo'], 
                required: true
            }, {
                model: Usuario,
                attributes: { exclude: ['password', 'contraseña'] } 
            }],
            order: [['fecha_aplicacion', 'DESC']]
        });
        return aplicaciones;
    } catch (err) {
        throw err;
    }
};