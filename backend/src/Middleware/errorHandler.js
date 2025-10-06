// backend/src/Middleware/errorHandler.js
import multer from 'multer';
export const errorHandler = (err, req, res, next) => {
  console.error('🔴 Error capturado:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'El archivo es demasiado grande. Máximo 5MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Campo de archivo inesperado'
      });
    }
    return res.status(400).json({
      message: `Error al subir archivo: ${err.message}`
    });
  }
  if (err.message && err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({
      message: err.message
    });
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};