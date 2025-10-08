import { Op } from 'sequelize';
import Oferta from '../Models/Oferta.js';
import Empresa from '../Models/Empresa.js'; 


export const crearOferta = async (datosOferta) => {
  try {
    const empresaExiste = await Empresa.findByPk(datosOferta.idempresa);
    if (!empresaExiste) {
      const error = new Error('La empresa especificada no existe');
      error.statusCode = 404;
      throw error;
    }

    const nuevaOferta = await Oferta.create(datosOferta);
    return nuevaOferta;
  } catch (err) {
    throw err;
  }
};
export const obtenerOfertaPorId = async (idoferta) => {
  try {
    const oferta = await Oferta.findByPk(idoferta, {
      include: [{
        model: Empresa 
      }]
    });

    if (!oferta) {
      const error = new Error('Oferta no encontrada');
      error.statusCode = 404;
      throw error;
    }
    return oferta;
  } catch (err) {
    throw err;
  }
};

export const obtenerOfertasPorEmpresa = async (idempresa) => {
  try {
    const ofertas = await Oferta.findAll({
      where: { idempresa },
      order: [['idoferta', 'DESC']], 
    });
    return ofertas;
  } catch (err) {
    throw err;
  }
};

export const obtenerTodasLasOfertas = async () => {
  try {
    const ofertas = await Oferta.findAll({
      order: [['idoferta', 'DESC']],
      include: [{
        model: Empresa,
        attributes: ['nombre', 'logo'] 
      }]
    });
    return ofertas;
  } catch (err) {
    throw err;
  }
};
export const actualizarOferta = async (idoferta, datosActualizados) => {
  try {
    const oferta = await obtenerOfertaPorId(idoferta); 
    delete datosActualizados.idempresa;

    await oferta.update(datosActualizados);
    return oferta;
  } catch (err) {
    throw err;
  }
};

export const eliminarOferta = async (idoferta) => {
  try {
    const oferta = await obtenerOfertaPorId(idoferta); 

    const numFilasEliminadas = await Oferta.destroy({
      where: { idoferta },
    });

    return numFilasEliminadas > 0;
  } catch (err) {
    throw err;
  }
};
export const buscarOfertas = async (criterios) => {
  try {
    const whereClause = {};

    if (criterios.titulo) {
      whereClause.titulo = { [Op.like]: `%${criterios.titulo}%` };
    }
    if (criterios.rubro) {
      whereClause.rubro = { [Op.like]: `%${criterios.rubro}%` };
    }
    if (criterios.tipo_contrato) {
        whereClause.tipo_contrato = { [Op.like]: `%${criterios.tipo_contrato}%` };
    }

    const ofertas = await Oferta.findAll({
      where: whereClause,
      order: [['idoferta', 'DESC']],
      include: [{
        model: Empresa,
        attributes: ['nombre', 'logo']
      }]
    });
    return ofertas;
  } catch (err) {
    throw err;
  }
};