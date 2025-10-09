import * as aplicacionService from '../Services/aplicacionService.js';
import * as ofertaService from '../Services/ofertaService.js';
export const postCrearAplicacion = async (req, res, next) => {
    try {
        const { idoferta } = req.params; 
        const idusuario = req.usuario.id; 
        if (!req.file) {
            const error = new Error('El archivo del currículum (CV) es obligatorio.');
            error.statusCode = 400;
            throw error;
        }

        const datosAplicacion = {
            idoferta: parseInt(idoferta),
            idusuario: idusuario,
            cv_path: req.file.filename, 
            carta_presentacion: req.body.carta_presentacion || null
        };
        console.log('✅ Aplicación creada correctamente, enviando respuesta al cliente...');
        const nuevaAplicacion = await aplicacionService.crearAplicacion(datosAplicacion);
        res.status(201).json({ 
            mensaje: 'Aplicación enviada exitosamente.',
            aplicacion: nuevaAplicacion
        });

    } catch (err) {
        if (req.file) {
        }
        next(err);
    }
};

export const getMisAplicaciones = async (req, res, next) => {
    try {
        const idusuario = req.usuario.id;
        const aplicaciones = await aplicacionService.obtenerAplicacionesPorUsuario(idusuario);
        res.status(200).json(aplicaciones);
        console.log('DATOS ENVIADOS AL FRONTEND:', JSON.stringify(aplicaciones, null, 2));
    } catch (err) {
        next(err);
    }
};
export const deleteAplicacion = async (req, res, next) => {
    try {
        const idaplicacion = req.params.id;
        const idusuario = req.usuario.id;

        await aplicacionService.eliminarAplicacion(idaplicacion, idusuario);
        res.status(200).json({ mensaje: 'Has retirado tu aplicación correctamente.' });
    } catch (err) {
        next(err);
    }
};
export const getAplicacionesPorOferta = async (req, res, next) => {
    try {
        const { idoferta } = req.params;
        const idempresaUsuario = req.usuario.idempresa;

        if (!idempresaUsuario) {
            const error = new Error('No tienes una empresa asignada.');
            error.statusCode = 403;
            throw error;
        }
        const oferta = await ofertaService.obtenerOfertaPorId(idoferta);
        if (oferta.idempresa !== idempresaUsuario) {
            const error = new Error('No tienes permiso para ver los aplicantes de esta oferta.');
            error.statusCode = 403;
            throw error;
        }
        
        const aplicaciones = await aplicacionService.obtenerAplicacionesPorOferta(idoferta);
        res.status(200).json(aplicaciones);
    } catch (err) {
        next(err);
    }
};
export const putActualizarEstado = async (req, res, next) => {
    try {
        const { idaplicacion } = req.params;
        const idempresaUsuario = req.usuario.idempresa;
        const { estado } = req.body;

        const aplicacionActualizada = await aplicacionService.actualizarEstadoAplicacion(idaplicacion, idempresaUsuario, estado);
        res.status(200).json(aplicacionActualizada);
    } catch (err) {
        next(err);
    }
};
export const getTodasAplicacionesDeEmpresa = async (req, res, next) => {
    try {
        const idempresa = req.usuario.idempresa;
        if (!idempresa) return res.json([]); 
        
        const aplicaciones = await aplicacionService.obtenerTodasAplicacionesDeEmpresa(idempresa);
        res.status(200).json(aplicaciones);
    } catch (err) {
        next(err);
    }
};