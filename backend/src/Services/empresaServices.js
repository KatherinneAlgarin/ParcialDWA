// /backend/src/Services/empresaServices.js
import Empresa from '../Models/Empresa.js';
import Usuario from '../Models/Usuario.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const obtenerEmpresaPorId = async (idempresa) => {
    try {
        const empresa = await Empresa.findByPk(idempresa);
        if (!empresa) {
            const error = new Error("Empresa no encontrada");
            error.statusCode = 404;
            throw error;
        }
        return empresa;
    } catch (err) {
        throw err;
    }
};
export const crearEmpresa = async (nombre, direccion, logo, descripcion, redesSociales) => {
    try {
        const existe = await Empresa.findOne({ where: { nombre } });
        if (existe) {
            const error = new Error("Ya existe una empresa con ese nombre");
            error.statusCode = 400;
            throw error;
        }
        const nuevaEmpresa = await Empresa.create({
            nombre,
            direccion,
            logo,
            descripcion,
            redesSociales
        });
        return nuevaEmpresa;
    } catch (err) {
        throw err;
    }
};
export const actualizarEmpresa = async (idempresa, datosActualizados) => {
    try {
        const empresa = await Empresa.findByPk(idempresa);
        if (!empresa) {
            return null;
        }
        
        
        await Empresa.update(datosActualizados, {
            where: { idempresa }
        });
        const empresaActualizada = await Empresa.findByPk(idempresa);
        return empresaActualizada;

    } catch (err) {
        throw err;
    }
};

export const eliminarEmpresa = async (idempresa) => {
    try {
        const empresa = await Empresa.findByPk(idempresa);
        
        if (!empresa) {
            const error = new Error("Empresa no encontrada");
            error.statusCode = 404;
            throw error;
        }
        await Usuario.update(
            { idempresa: null },
            { where: { idempresa } }
        );
        if (empresa.logo) {
            const rutaLogo = path.join(__dirname, '../uploads/fotoPerfil', empresa.logo);
            if (fs.existsSync(rutaLogo)) {
                try {
                    fs.unlinkSync(rutaLogo);
                    console.log('🗑️ Logo eliminado:', empresa.logo);
                } catch (error) {
                    console.error('⚠️ Error al eliminar logo:', error);
                }
            }
        }
        const numFilasEliminadas = await Empresa.destroy({
            where: { idempresa }
        });
        return numFilasEliminadas > 0;
    } catch (err) {
        throw err;
    }
};

export const buscarEmpresasPorNombre = async (nombre) => {
    try {
        const empresas = await Empresa.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${nombre}%`
                }
            }
        });
        return empresas;
    } catch (err) {
        throw err;
    }
};

export const obtenerTodasLasEmpresas = async () => {
    try {
        const empresas = await Empresa.findAll();
        return empresas;
    } catch (err) {
        throw err;
    }
};
export const existeEmpresa = async (idempresa) => {
    try {
        const empresa = await Empresa.findByPk(idempresa);
        return empresa !== null;
    } catch (err) {
        throw err;
    }
};

export const obtenerEmpresaPorUsuario = async (idUsuario) => {
    try {
        const usuario = await Usuario.findByPk(idUsuario);
        
        if (!usuario) {
            const error = new Error("Usuario no encontrado");
            error.statusCode = 404;
            throw error;
        }

        if (!usuario.idempresa) {
            const error = new Error("El usuario no tiene empresa asociada");
            error.statusCode = 404;
            throw error;
        }
        const empresa = await Empresa.findByPk(usuario.idempresa);
        
        if (!empresa) {
            const error = new Error("Empresa no encontrada");
            error.statusCode = 404;
            throw error;
        }
        return empresa;
    } catch (err) {
        throw err;
    }
};