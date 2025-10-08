import Resena from '../Models/Resena.js';
import Usuario from '../Models/Usuario.js';
export const crearResena = async (datosResena) => {
    try {
        const resenaExistente = await Resena.findOne({
            where: {
                idusuario: datosResena.idusuario,
                idempresa: datosResena.idempresa
            }
        });

        if (resenaExistente) {
            const error = new Error('Ya has valorado esta empresa anteriormente.');
            error.statusCode = 409;
            throw error;
        }

        const nuevaResena = await Resena.create(datosResena);
        return nuevaResena;
    } catch (err) {
        throw err;
    }
};
export const obtenerResenasPorEmpresa = async (idempresa) => {
    try {
        const resenas = await Resena.findAll({
            where: { idempresa },
            include: [{
                model: Usuario,
                attributes: ['id', 'nombre', 'foto_perfil'] 
            }],
            order: [['fecha', 'DESC']] 
        });
        return resenas;
    } catch (err) {
        throw err;
    }
};
export const actualizarResena = async (idresena, idusuario, datosActualizados) => {
    try {
        const resena = await Resena.findByPk(idresena);
        if (!resena) {
            const error = new Error('Reseña no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        if (resena.idusuario !== idusuario) {
            const error = new Error('No tienes permisos para editar esta reseña.');
            error.statusCode = 403;
            throw error;
        }
        await resena.update(datosActualizados);
        return resena;
    } catch (err) {
        throw err;
    }
};

export const eliminarResena = async (idresena, idusuario) => {
    try {
        const resena = await Resena.findByPk(idresena);
        if (!resena) {
            const error = new Error('Reseña no encontrada.');
            error.statusCode = 404;
            throw error;
        }
        if (resena.idusuario !== idusuario) {
            const error = new Error('No tienes permisos para eliminar esta reseña.');
            error.statusCode = 403;
            throw error;
        }
        await resena.destroy();
        return true;
    } catch (err) {
        throw err;
    }
};