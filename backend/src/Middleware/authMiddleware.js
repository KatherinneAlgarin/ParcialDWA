// backend/src/Middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      const error = new Error('Token no proporcionado');
      error.statusCode = 401;
      throw error;
    }
    const token = authHeader.split(' ')[1]; 
    
    if (!token) {
      const error = new Error('Formato de token inválido');
      error.statusCode = 401;
      throw error;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      err.message = 'Token inválido';
      err.statusCode = 401;
    } else if (err.name === 'TokenExpiredError') {
      err.message = 'Token expirado';
      err.statusCode = 401;
    }
    next(err);
  }
};

export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        const error = new Error('Usuario no autenticado');
        error.statusCode = 401;
        throw error;
      }

      if (!rolesPermitidos.includes(req.usuario.rol)) {
        const error = new Error('No tienes permisos para acceder a este recurso');
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
export const generarToken = (payload) => {
  try {
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, 
      {
        expiresIn: '1d' 
      }
    );
    return token;
  } catch (error) {
    console.error('Error al generar el token:', error);
    throw new Error('No se pudo generar el token de autenticación.');
  }
};