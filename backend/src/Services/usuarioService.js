import bcrypt from "bcrypt";
import Usuario from '../Models/Usuario.js';

// Crear un nuevo usuario
export const crearUsuario = async (nombre, correo, password, rol) => {
  try {
    // 🔹 Generar el hash
    const saltRounds = 10; // nivel de encriptado (recomendado 10-12)
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 🔹 Crear el usuario con la contraseña encriptada
    const nuevoUsuario = await Usuario.create({
      nombre, correo, password: hashedPassword, rol
    });

    return nuevoUsuario;
  } catch (err) {
    throw err;
  }
};
//Login de usuario
export const loginUsuario = async (correo, password) => {
  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      throw new Error("Contraseña incorrecta");
    }
    return usuario; // login exitoso
  } catch (err) {
    throw err;
  }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async () => {
    try {
        const usuarios = await Usuario.findAll();
        return usuarios;
    } catch (err) {
        throw err;
    }
};

// Obtener usuario por ID
export const obtenerUsuarioPorId = async (id) => {
    try {
        const usuario = await Usuario.findByPk(id);
        return usuario;
    } catch (err) {
        throw err;
    }
};

// Obtener usuario por correo
export const obtenerUsuarioPorCorreo = async (correo) => {
    try {
        const usuario = await Usuario.findOne({
            where: { correo }
        });
        return usuario;
    } catch (err) {
        throw err;
    }
};

// Actualizar usuario
export const actualizarUsuario = async (id, datosActualizados) => {
    try {
        const [numFilasActualizadas] = await Usuario.update(datosActualizados, {
            where: { id }
        });
        
        if (numFilasActualizadas === 0) {
            return null;
        }
        
        const usuarioActualizado = await Usuario.findByPk(id);
        return usuarioActualizado;
    } catch (err) {
        throw err;
    }
};

// Actualizar foto de perfil
export const actualizarFotoPerfil = async (id, nombreArchivo) => {
    try {
        const [numFilasActualizadas] = await Usuario.update(
            { foto_perfil: nombreArchivo },
            { where: { id } }
        );
        
        if (numFilasActualizadas === 0) {
            return null;
        }
        
        return await Usuario.findByPk(id);
    } catch (err) {
        throw err;
    }
};

// Actualizar curriculum
export const actualizarCurriculum = async (id, nombreArchivo) => {
    try {
        const [numFilasActualizadas] = await Usuario.update(
            { curriculum_path: nombreArchivo },
            { where: { id } }
        );
        
        if (numFilasActualizadas === 0) {
            return null;
        }
        
        return await Usuario.findByPk(id);
    } catch (err) {
        throw err;
    }
};

// Eliminar usuario
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

// Buscar usuarios por rol
export const obtenerUsuariosPorRol = async (rol) => {
    try {
        const usuarios = await Usuario.findAll({
            where: { rol }
        });
        return usuarios;
    } catch (err) {
        throw err;
    }
};