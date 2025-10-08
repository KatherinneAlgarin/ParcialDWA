import { Op } from 'sequelize';
import sequelize from '../Config/db.js';
import Foro from '../Models/Foro.js';
import Usuario from '../Models/Usuario.js';
import RespuestaForo from '../Models/RespuestaForo.js';

export const crearTemaForo = async (datosForo) => {
    return await Foro.create(datosForo);
};

export const obtenerTodosLosTemas = async (termino = '') => {
    try {
        const whereClause = {};
        if (termino) {
            whereClause.titulo = { [Op.like]: `%${termino}%` };
        }
        const temas = await Foro.findAll({
            where: whereClause,
            include: [
                { model: Usuario, attributes: ['id', 'nombre', 'foto_perfil'] },
                { model: RespuestaForo, attributes: [] }
            ],
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('RespuestaForos.idrespuesta')), 'totalRespuestas']
                ]
            },
            group: ['Foro.idforo', 'Usuario.id'],
            order: [['fecha_creacion', 'DESC']]
        });
        return temas;
    } catch (err) {
        throw err;
    }
};

export const obtenerTemaPorId = async (idforo) => {
    const tema = await Foro.findByPk(idforo, {
        include: [
            { model: Usuario, attributes: ['nombre', 'foto_perfil'] },
            {
                model: RespuestaForo,
                as: 'RespuestaForos',
                where: { parent_id: null },
                required: false,
                include: [
                    { model: Usuario, attributes: ['id', 'nombre', 'foto_perfil'] },
                    ...incluirAnidadas()
                ]
            }
        ],
        order: [
            [sequelize.literal('`RespuestaForos`.`fecha_respuesta`'), 'ASC']
        ]
    });

    if (!tema) {
        throw new Error('Tema del foro no encontrado.');
    }
    return tema;
};
const incluirAnidadas = (nivelMax = 5) => {
    if (nivelMax <= 0) {
        return []; 
    }
    return [{
        model: RespuestaForo,
        as: 'Hijas',
        required: false,
        include: [
            { model: Usuario, attributes: ['nombre', 'foto_perfil'] },
            {
                model: RespuestaForo,
                as: 'Padre',
                required: false,
                include: [{ model: Usuario, attributes: ['nombre'] }]
            },
            ...incluirAnidadas(nivelMax - 1)
        ]
    }];
};

export const actualizarTemaForo = async (idforo, idusuario, datos) => {
    const tema = await Foro.findByPk(idforo);
    if (!tema) throw new Error('Tema no encontrado.');
    if (tema.idusuario !== idusuario) throw new Error('No tienes permiso para editar este tema.');
    return await tema.update(datos);
};

export const eliminarTemaForo = async (idforo, idusuario) => {
    const tema = await Foro.findByPk(idforo);
    if (!tema) throw new Error('Tema no encontrado.');
    if (tema.idusuario !== idusuario) throw new Error('No tienes permiso para eliminar este tema.');
    return await tema.destroy();
};