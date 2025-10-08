import * as ofertaService from '../Services/ofertaService.js';
export const crearNuevaOferta = async (req, res, next) => {
  try {
    const idempresa = req.usuario.idempresa;
    if (!idempresa) {
      const error = new Error('No tienes una empresa asociada para publicar ofertas.');
      error.statusCode = 403; 
      throw error;
    }
    const datosOferta = { ...req.body, idempresa };

    const nuevaOferta = await ofertaService.crearOferta(datosOferta);
    res.status(201).json(nuevaOferta);
  } catch (err) {
    next(err);
  }
};
export const actualizarOfertaExistente = async (req, res, next) => {
  try {
    const idoferta = req.params.id;
    const idempresaUsuario = req.usuario.idempresa;
    const datosActualizados = req.body;
    const ofertaOriginal = await ofertaService.obtenerOfertaPorId(idoferta);
    if (ofertaOriginal.idempresa !== idempresaUsuario) {
      const error = new Error('No tienes permisos para editar esta oferta.');
      error.statusCode = 403; 
      throw error;
    }
    const ofertaActualizada = await ofertaService.actualizarOferta(idoferta, datosActualizados);
    res.status(200).json(ofertaActualizada);
  } catch (err) {
    next(err);
  }
};
export const eliminarOfertaExistente = async (req, res, next) => {
  try {
    const idoferta = req.params.id;
    const idempresaUsuario = req.usuario.idempresa;
    const ofertaOriginal = await ofertaService.obtenerOfertaPorId(idoferta);
    if (ofertaOriginal.idempresa !== idempresaUsuario) {
      const error = new Error('No tienes permisos para eliminar esta oferta.');
      error.statusCode = 403; 
      throw error;
    }

    await ofertaService.eliminarOferta(idoferta);
    res.status(200).json({ mensaje: 'Oferta eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};
export const getOfertasDeMiEmpresa = async (req, res, next) => {
  try {
    const idempresa = req.usuario.idempresa;
    if (!idempresa) {
      return res.status(200).json([]);
    }
    const ofertas = await ofertaService.obtenerOfertasPorEmpresa(idempresa);
    res.status(200).json(ofertas);
  } catch (err) {
    next(err);
  }
};
export const getTodasLasOfertas = async (req, res, next) => {
  try {
    const ofertas = await ofertaService.obtenerTodasLasOfertas();
    res.status(200).json(ofertas);
  } catch (err) {
    next(err);
  }
};
export const getOfertaPorId = async (req, res, next) => {
  try {
    const oferta = await ofertaService.obtenerOfertaPorId(req.params.id);
    res.status(200).json(oferta);
  } catch (err) {
    next(err);
  }
};
export const getBuscarOfertas = async (req, res, next) => {
  try {
    const ofertas = await ofertaService.buscarOfertas(req.query);
    res.status(200).json(ofertas);
  } catch (err) {
    next(err);
  }
};