import bcrypt from "bcrypt";
import Usuario from '../Models/Usuario.js';
import OTPService from './otpService.js';
import EmailService from './emailService.js';

export const solicitarRecuperacion = async (correo) => {
  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    
    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }
    const otp = OTPService.generateOTP();
    OTPService.saveOTP(correo, otp, 10);
    const userName = usuario.nombre || 'Usuario';
    const result = await EmailService.sendOTPEmail(correo, otp, userName);

    if (!result.success) {
      const error = new Error("Error al enviar el correo electrónico");
      error.statusCode = 500;
      throw error;
    }

    return { 
      success: true, 
      message: 'Código OTP enviado a tu correo electrónico',
      correo: correo
    };

  } catch (err) {
    throw err;
  }
};
export const verificarOTP = async (correo, otp) => {
  try {
    const result = OTPService.verifyOTP(correo, otp);

    if (!result.valid) {
      const error = new Error(result.message);
      error.statusCode = 400;
      throw error;
    }

    return { 
      success: true, 
      message: result.message,
      verified: true 
    };

  } catch (err) {
    throw err;
  }
};

export const restablecerPassword = async (correo, otp, nuevaPassword) => {
  try {
    const otpResult = OTPService.verifyOTP(correo, otp);

    if (!otpResult.valid) {
      const error = new Error(otpResult.message);
      error.statusCode = 400;
      throw error;
    }
    const usuario = await Usuario.findOne({ where: { correo } });
    
    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nuevaPassword, saltRounds);

    await usuario.update({ password: hashedPassword });
    OTPService.deleteOTP(correo);

    return { 
      success: true, 
      message: 'Contraseña actualizada correctamente' 
    };

  } catch (err) {
    throw err;
  }
};