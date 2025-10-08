import * as foroService from '../Services/foroService.js';
import sequelize from '../Config/db.js';

export const postCrearTema = async (req, res, next) => {
    try {
        const { titulo, descripcion } = req.body;
        const nuevoTema = await foroService.crearTemaForo({ titulo, descripcion, idusuario: req.usuario.id });
        res.status(201).json(nuevoTema);
    } catch(err) { next(err); }
};

export const getTodosLosTemas = async (req, res, next) => {
    try {
        const temas = await foroService.obtenerTodosLosTemas(req.query.busqueda);
        res.status(200).json(temas);
    } catch(err) { next(err); }
};

export const getTemaPorId = async (req, res, next) => {
    try {
        const tema = await foroService.obtenerTemaPorId(req.params.id);
        res.status(200).json(tema);
    } catch(err) { next(err); }
};

export const putActualizarTema = async (req, res, next) => {
    try {
        const tema = await foroService.actualizarTemaForo(req.params.id, req.usuario.id, req.body);
        res.status(200).json(tema);
    } catch(err) { next(err); }
};

export const deleteTema = async (req, res, next) => {
    try {
        await foroService.eliminarTemaForo(req.params.id, req.usuario.id);
        res.status(200).json({ mensaje: 'Tema eliminado correctamente.' });
    } catch(err) { next(err); }
};