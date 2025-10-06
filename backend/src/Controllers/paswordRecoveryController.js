
import * as passwordRecoveryService from '../Services/passwordRecoveryService.js';
export const postSolicitarOTP = async (req, res, next) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      const error = new Error("El correo es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    const result = await passwordRecoveryService.solicitarRecuperacion(correo);
    
    res.status(200).json(result);

  } catch (err) {
    next(err);
  }
};
export const postVerificarOTP = async (req, res, next) => {
  try {
    const { correo, otp } = req.body;

    if (!correo || !otp) {
      const error = new Error("Correo y OTP son obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const result = await passwordRecoveryService.verificarOTP(correo, otp);
    
    res.status(200).json(result);

  } catch (err) {
    next(err);
  }
};
export const postRestablecerPassword = async (req, res, next) => {
  try {
    const { correo, otp, nuevaPassword } = req.body;
    if (!correo || !otp || !nuevaPassword) {
      const error = new Error("Correo, OTP y nueva contraseña son obligatorios");
      error.statusCode = 400;
      throw error;
    }
    if (nuevaPassword.length < 6) {
      const error = new Error("La contraseña debe tener al menos 6 caracteres");
      error.statusCode = 400;
      throw error;
    }
    const result = await passwordRecoveryService.restablecerPassword(correo, otp, nuevaPassword);
    
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};