// backend/src/Controllers/usuarioController.js
import * as usuarioService from "../Services/usuarioService.js";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const postCrearUsuario = async (req, res, next) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password || !rol) {
      const error = new Error("Todos los campos son obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const nuevoUsuario = await usuarioService.crearUsuario(nombre, correo, password, rol);
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    next(err);
  }
};

export const loginUsuario = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      const error = new Error("Correo y contraseña son obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const usuario = await usuarioService.loginUsuario(correo, password);

    if (!usuario) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    if (usuario.rol !== 'Empleador' && usuario.rol !== 'Candidato') {
      const error = new Error("Rol de usuario no válido");
      error.statusCode = 403;
      throw error;
    }
    const token = jwt.sign(
      { 
        id: usuario.id, 
        correo: usuario.correo,
        rol: usuario.rol,
        idempresa: usuario.idempresa,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      mensaje: "Login exitoso", 
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        idempresa: usuario.idempresa,
        foto_perfil: usuario.foto_perfil
      }
    });

  } catch (err) {
    next(err);
  }
};

export const obtenerPerfil = async (req, res, next) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(req.usuario.id);

    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
};

export const putActualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.usuario.id !== parseInt(id)) {
      if (req.file) {
        const rutaArchivo = path.join(__dirname, '../uploads/fotoPerfil', req.file.filename);
        if (fs.existsSync(rutaArchivo)) {
          fs.unlinkSync(rutaArchivo);
        }
      }
      const error = new Error("No tienes permisos para actualizar este usuario");
      error.statusCode = 403;
      throw error;
    }

    let datosActualizados = { ...req.body };
    if (req.file) {
      datosActualizados.foto_perfil = req.file.filename;
    }
    delete datosActualizados.password;
    delete datosActualizados.contraseña;
    delete datosActualizados.rol;
    delete datosActualizados.id;
    delete datosActualizados.curriculum_path; 
    delete datosActualizados.idempresa; 
    Object.keys(datosActualizados).forEach(key => {
      if (datosActualizados[key] === '' || datosActualizados[key] === 'null' || datosActualizados[key] === 'undefined') {
        datosActualizados[key] = null;
      }
    });
    const usuarioActualizado = await usuarioService.actualizarUsuario(id, datosActualizados);

    if (!usuarioActualizado) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(usuarioActualizado);
    
  } catch (err) {
    console.error('❌ Error en putActualizarUsuario:', err);
    if (req.file) {
      const rutaArchivo = path.join(__dirname, '../uploads/fotoPerfil', req.file.filename);
      if (fs.existsSync(rutaArchivo)) {
        fs.unlinkSync(rutaArchivo);
        console.log('🗑️ Archivo eliminado por error:', req.file.filename);
      }
    }
    
    next(err);
  }
};
export const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.usuario.id !== parseInt(id)) {
      const error = new Error("No tienes permisos para eliminar este usuario");
      error.statusCode = 403;
      throw error;
    }
    const eliminado = await usuarioService.eliminarUsuario(id);
    if (!eliminado) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};