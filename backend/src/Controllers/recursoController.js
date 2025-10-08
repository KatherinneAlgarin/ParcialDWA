import * as recursoService from '../Services/recursoService.js';

export const getTodosLosRecursos = async (req, res, next) => {
    try {
        const { busqueda } = req.query;
        const recursos = await recursoService.obtenerTodosLosRecursos(busqueda);
        res.status(200).json(recursos);
    } catch (err) {
        next(err);
    }
};

export const postCrearRecurso = async (req, res, next) => {
    try {
        const idempresa = req.usuario.idempresa;
        if (!idempresa) {
            const error = new Error('Debes estar asociado a una empresa para publicar un recurso.');
            error.statusCode = 403;
            throw error;
        }
        const datosRecurso = { ...req.body, idempresa };
        const nuevoRecurso = await recursoService.crearRecurso(datosRecurso);
        res.status(201).json(nuevoRecurso);
    } catch (err) {
        next(err);
    }
};

export const putActualizarRecurso = async (req, res, next) => {
    try {
        const idrecurso = req.params.id;
        const idempresaUsuario = req.usuario.idempresa;
        const recursoActualizado = await recursoService.actualizarRecurso(idrecurso, idempresaUsuario, req.body);
        res.status(200).json(recursoActualizado);
    } catch (err) {
        next(err);
    }
};

export const deleteRecurso = async (req, res, next) => {
    try {
        const idrecurso = req.params.id;
        const idempresaUsuario = req.usuario.idempresa;
        await recursoService.eliminarRecurso(idrecurso, idempresaUsuario);
        res.status(200).json({ message: 'Recurso eliminado correctamente.' });
    } catch (err) {
        next(err);
    }
};
export const getMisRecursos = async (req, res, next) => {
    try {
        const idempresa = req.usuario.idempresa;
        if (!idempresa) return res.json([]); 
        
        const recursos = await recursoService.obtenerRecursosPorEmpresa(idempresa);
        res.status(200).json(recursos);
    } catch (err) {
        next(err);
    }
};