import * as respuestaService from '../Services/respuestaForoService.js';

export const postCrearRespuesta = async (req, res, next) => {
    try {
        const { idforo, contenido, parent_id } = req.body;
        const datos = { idforo, contenido, parent_id, idusuario: req.usuario.id };
        const nuevaRespuesta = await respuestaService.crearRespuesta(datos);
        res.status(201).json(nuevaRespuesta);
    } catch(err) { next(err); }
};

export const putActualizarRespuesta = async (req, res, next) => {
    try {
        const respuesta = await respuestaService.actualizarRespuesta(req.params.id, req.usuario.id, req.body);
        res.status(200).json(respuesta);
    } catch(err) { next(err); }
};

export const deleteRespuesta = async (req, res, next) => {
    try {
        await respuestaService.eliminarRespuesta(req.params.id, req.usuario.id);
        res.status(200).json({ mensaje: 'Respuesta eliminada correctamente.' });
    } catch(err) { next(err); }
};