
import transporter from '../Config/emailConfig.js';

class EmailService {

  static async sendOTPEmail(email, otp, userName) {
    const COMPANY_NAME = process.env.COMPANY_NAME || 'WorkLink';

    const mailOptions = {
      from: `${COMPANY_NAME} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${COMPANY_NAME} - Recuperación de Contraseña`,
      text: `Hola ${userName}, usa el código ${otp} para restablecer tu contraseña en ${COMPANY_NAME}. Código válido por 10 minutos.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0; padding:0; background-color:#f5f5f5; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:30px; text-align:center;">
                      <h1 style="color:#ffffff; margin:0; font-size:24px;">${COMPANY_NAME}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 30px;">
                      <h2 style="color:#333333; margin:0 0 20px 0; font-size:22px;">¡Hola ${userName}!</h2>
                      <p style="color:#555555; font-size:16px; line-height:1.6; margin:0 0 30px 0;">
                        Usa el siguiente código para restablecer tu contraseña:
                      </p>
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:8px; padding:20px; text-align:center; margin:0 0 30px 0;">
                        <div style="background-color:#ffffff; border-radius:6px; padding:20px; display:inline-block;">
                          <span style="color:#667eea; font-size:32px; font-weight:bold; letter-spacing:8px; font-family:'Courier New', monospace;">
                            ${otp}
                          </span>
                        </div>
                      </div>
                      <p style="color:#856404; background-color:#fff3cd; border-left:4px solid #ffc107; padding:15px; border-radius:4px; font-size:14px; margin:0 0 20px 0;">
                        ⏱️ Este código expirará en 10 minutos.
                      </p>
                      <p style="color:#555555; font-size:14px; line-height:1.6; margin:0;">
                        Si no solicitaste este cambio, ignora este correo.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color:#f8f9fa; padding:20px 30px; text-align:center; border-top:1px solid #e9ecef;">
                      <p style="color:#6c757d; font-size:12px; margin:0 0 10px 0;">
                        Correo automático, no respondas a este mensaje.
                      </p>
                      <p style="color:#6c757d; font-size:12px; margin:0;">
                        © ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, message: 'Email enviado correctamente' };
    } catch (error) {
      console.error('Error al enviar email:', error);
      return { success: false, message: 'Error al enviar el email', error };
    }
  }
}

export default EmailService;