import { Op } from 'sequelize';
import Recurso from '../Models/Recurso.js';
import Empresa from '../Models/Empresa.js';
import Usuario from '../Models/Usuario.js';

export const crearRecurso = async (datosRecurso) => {
    try {
        return await Recurso.create(datosRecurso);
    } catch (err) {
        throw err;
    }
};

export const obtenerTodosLosRecursos = async (terminoBusqueda = '') => {
    try {
        const whereClause = {};
        if (terminoBusqueda) {
            whereClause.titulo = { [Op.like]: `%${terminoBusqueda}%` };
        }
        return await Recurso.findAll({
            where: whereClause,
            include: [{
                model: Empresa,
                attributes: ['nombre', 'logo']
            }],
            order: [['idrecurso', 'DESC']]
        });
    } catch (err) {
        throw err;
    }
};
export const actualizarRecurso = async (idrecurso, idempresaUsuario, datos) => {
    try {
        const recurso = await Recurso.findByPk(idrecurso);
        if (!recurso) {
            const error = new Error('Recurso no encontrado.');
            error.statusCode = 404;
            throw error;
        }
        if (recurso.idempresa !== idempresaUsuario) {
            const error = new Error('No tienes permiso para editar este recurso.');
            error.statusCode = 403;
            throw error;
        }
        return await recurso.update(datos);
    } catch (err) {
        throw err;
    }
};
export const eliminarRecurso = async (idrecurso, idempresaUsuario) => {
    try {
        const recurso = await Recurso.findByPk(idrecurso);
        if (!recurso) {
            const error = new Error('Recurso no encontrado.');
            error.statusCode = 404;
            throw error;
        }
        if (recurso.idempresa !== idempresaUsuario) {
            const error = new Error('No tienes permiso para eliminar este recurso.');
            error.statusCode = 403;
            throw error;
        }
        await recurso.destroy();
        return true;
    } catch (err) {
        throw err;
    }
};