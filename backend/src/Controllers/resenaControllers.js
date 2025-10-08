// backend/src/Controllers/resenaControllers.js
import * as resenaService from '../Services/resenaService.js';

export const postCrearResena = async (req, res, next) => {
    try {
        const idempresa = req.params.idempresa; 
        const idusuario = req.usuario.id; 
        const { calificacion, comentario } = req.body;
        if (req.usuario.rol === 'Empleador' && req.usuario.idempresa === parseInt(idempresa)) {
            const error = new Error('No puedes valorar tu propia empresa.');
            error.statusCode = 403; 
            throw error;
        }

        const datosResena = { idusuario, idempresa, calificacion, comentario };
        const nuevaResena = await resenaService.crearResena(datosResena);
        
        res.status(201).json(nuevaResena);
    } catch (err) {
        next(err);
    }
};
export const getResenasPorEmpresa = async (req, res, next) => {
    try {
        const { idempresa } = req.params;
        const resenas = await resenaService.obtenerResenasPorEmpresa(idempresa);
        res.status(200).json(resenas);
    } catch (err) {
        next(err);
    }
};
export const putActualizarResena = async (req, res, next) => {
    try {
        const idresena = req.params.id;
        const idusuario = req.usuario.id;
        const datosActualizados = req.body;
        const resenaActualizada = await resenaService.actualizarResena(idresena, idusuario, datosActualizados);
        res.status(200).json(resenaActualizada);
    } catch (err) {
        next(err);
    }
};
export const deleteResena = async (req, res, next) => {
    try {
        const idresena = req.params.id;
        const idusuario = req.usuario.id;
        await resenaService.eliminarResena(idresena, idusuario);
        res.status(200).json({ mensaje: 'Reseña eliminada correctamente.' });
    } catch (err) {
        next(err);
    }
};