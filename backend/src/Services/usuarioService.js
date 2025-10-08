// backend/src/Services/usuarioService.js
import bcrypt from "bcrypt";
import Usuario from '../Models/Usuario.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
export const crearUsuario = async (nombre, correo, password, rol) => {
    try {
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
        const error = new Error("El correo ya está registrado");
        error.statusCode = 400;
        throw error;
    }
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const nuevoUsuario = await Usuario.create({
        nombre, correo, password: hashedPassword, rol
    });

    return nuevoUsuario;
    } catch (err) {
    throw err;
    }
};
export const loginUsuario = async (correo, password) => {
    try {
        const usuario = await Usuario.findOne({ where: { correo } });
        
        if (!usuario) {
            const error = new Error("Usuario no encontrado");
            error.statusCode = 401;
            throw error;
        }
        
        const esValida = await bcrypt.compare(password, usuario.password);
        
        if (!esValida) {
            const error = new Error("Contraseña incorrecta");
            error.statusCode = 401;
            throw error;
        }
        
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
            idempresa: usuario.idempresa,
            foto_perfil: usuario.foto_perfil,
            curriculum_path: usuario.curriculum_path
        };
    } catch (err) {
        throw err;
    }
};

export const obtenerUsuarioPorId = async (id) => {
    try {
        const usuario = await Usuario.findByPk(id);
        return usuario;
    } catch (err) {
        throw err;
    }
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const actualizarUsuario = async (id, datosActualizados) => {
    try {
        if (datosActualizados.foto_perfil) {
        const usuarioActual = await Usuario.findByPk(id);
        
        if (usuarioActual && usuarioActual.foto_perfil) {
            const rutaAnterior = path.join(__dirname, '../uploads/fotoPerfil', usuarioActual.foto_perfil);
            
            if (fs.existsSync(rutaAnterior)) {
            try {
                fs.unlinkSync(rutaAnterior);
                console.log('🗑️ Foto anterior eliminada:', usuarioActual.foto_perfil);
            } catch (error) {
                console.error('⚠️ Error al eliminar foto anterior:', error);
            }
            }
        }
    }

    const [numFilasActualizadas] = await Usuario.update(datosActualizados, {
        where: { id }
    });
    
    if (numFilasActualizadas === 0) {
        return null;
    }
    const usuarioActualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ['password', 'contraseña'] }
    });
    
    return usuarioActualizado;
    } catch (err) {
    throw err;
    }
};

export const eliminarUsuario = async (id) => {
    try {
        const numFilasEliminadas = await Usuario.destroy({
            where: { id }
        });
        return numFilasEliminadas > 0;
    } catch (err) {
        throw err;
    }
};

