
const otpStore = new Map();

class OTPService {
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }


  static saveOTP(email, otp, expirationMinutes = 10) {
    otpStore.set(email, {
      otp: otp,
      expiresAt: Date.now() + expirationMinutes * 60 * 1000
    });
  }
  static verifyOTP(email, otp) {
    const storedData = otpStore.get(email);

    if (!storedData) {
      return { valid: false, message: 'OTP no encontrado o expirado' };
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return { valid: false, message: 'El OTP ha expirado' };
    }

    if (storedData.otp !== otp) {
      return { valid: false, message: 'OTP incorrecto' };
    }

    return { valid: true, message: 'OTP verificado correctamente' };
  }

  static deleteOTP(email) {
    otpStore.delete(email);
  }
  static cleanExpiredOTPs() {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
      if (now > data.expiresAt) {
        otpStore.delete(email);
      }
    }
  }
}
setInterval(() => {
  OTPService.cleanExpiredOTPs();
}, 5 * 60 * 1000);

export default OTPService;