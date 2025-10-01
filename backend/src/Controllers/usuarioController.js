import * as usuarioService from "../Services/usuarioService.js";
import uploadProfile from '../Config/multerProfile.js';
import uploadCV from '../Config/multerCurriculums.js';
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

    res.status(200).json({ mensaje: "Login exitoso", usuario });
  } catch (err) {
    next(err);
  }
};

export const putActualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    const usuarioActualizado = await usuarioService.actualizarUsuario(id, datosActualizados);

    if (!usuarioActualizado) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(usuarioActualizado);
  } catch (err) {
    next(err);
  }
};

export const putActualizarFotoPerfil = (req, res, next) => {
  uploadProfile.single('fotoPerfil')(req, res, async (err) => {
    try {
      if (err) return next(err);

      const { id } = req.params;
      if (!req.file) {
        const error = new Error("No se subió ninguna imagen");
        error.statusCode = 400;
        throw error;
      }

      const usuarioActualizado = await usuarioService.actualizarFotoPerfil(id, req.file.path);

      if (!usuarioActualizado) {
        const error = new Error("Usuario no encontrado");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json(usuarioActualizado);
    } catch (err) {
      next(err);
    }
  });
};

export const putActualizarCurriculum = (req, res, next) => {
  uploadCV.single('curriculum')(req, res, async (err) => {
    try {
      if (err) return next(err);

      const { id } = req.params;
      if (!req.file) {
        const error = new Error("No se subió ningún archivo");
        error.statusCode = 400;
        throw error;
      }

      const usuarioActualizado = await usuarioService.actualizarCurriculum(id, req.file.path);

      if (!usuarioActualizado) {
        const error = new Error("Usuario no encontrado");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json(usuarioActualizado);
    } catch (err) {
      next(err);
    }
  });
};

export const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

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
