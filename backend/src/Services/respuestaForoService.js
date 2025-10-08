// backend/src/Services/respuestaForoService.js
import RespuestaForo from '../Models/RespuestaForo.js';

export const crearRespuesta = async (datos) => {
    return await RespuestaForo.create(datos);
};

export const actualizarRespuesta = async (idrespuesta, idusuario, datos) => {
    const respuesta = await RespuestaForo.findByPk(idrespuesta);
    if (!respuesta) {
        const error = new Error('Respuesta no encontrada.');
        error.statusCode = 404;
        throw error;
    }
    if (respuesta.idusuario !== idusuario) {
        const error = new Error('No tienes permiso para editar esta respuesta.');
        error.statusCode = 403;
        throw error;
    }
    return await respuesta.update(datos);
};

export const eliminarRespuesta = async (idrespuesta, idusuario) => {
    const respuesta = await RespuestaForo.findByPk(idrespuesta);
    if (!respuesta) {
        const error = new Error('Respuesta no encontrada.');
        error.statusCode = 404;
        throw error;
    }
    if (respuesta.idusuario !== idusuario) {
        const error = new Error('No tienes permiso para eliminar esta respuesta.');
        error.statusCode = 403;
        throw error;
    }
    return await respuesta.destroy();
};