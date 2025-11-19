// File: frontend/worklink/src/app/components/recover-password/recover-password.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './recover-password.html',
  styleUrls: ['./recover-password.css']
})
export class RecoverPasswordComponent {
  email: string = '';
  otp: string = '';

  otpSectionVisible: boolean = false;
  emailDisabled: boolean = false;
  isSendingCode: boolean = false;
  isVerifyingOtp: boolean = false;

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | 'info' = 'danger';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private setAlert(message: string, type: 'success' | 'danger' | 'info' = 'danger') {
    this.alertMessage = message;
    this.alertType = type;
  }

  private clearAlert() {
    this.alertMessage = null;
  }

  onSendCode() {
    if (!this.email) return;

    this.clearAlert();
    this.isSendingCode = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isSendingCode = false;
        this.otpSectionVisible = true;
        this.emailDisabled = true; 
        this.setAlert(`Código enviado a <strong>${this.email}</strong>. Revisa tu bandeja de entrada.`, 'success');
      },
      error: (err) => {
        this.isSendingCode = false;
        const message = err.error?.message || err.error?.error || 'Error al enviar el código';
        this.setAlert(message, 'danger');
      }
    });
  }

  onValidateOtp() {
    if (this.otp.length !== 6) {
      this.setAlert('El código OTP debe tener 6 dígitos', 'danger');
      return;
    }

    this.clearAlert();
    this.isVerifyingOtp = true;

    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (response) => {
        if (response.verified) {
          this.isVerifyingOtp = false;
          this.setAlert('✓ Código verificado. Redirigiendo...', 'success');

          sessionStorage.setItem('recovery_email', this.email);
          sessionStorage.setItem('recovery_otp', this.otp);

          setTimeout(() => {
            this.router.navigate(['/nueva-contrasena']); 
          }, 1500);
        } else {
          this.onVerificationError('Código OTP incorrecto o expirado');
        }
      },
      error: (err) => {
        const message = err.error?.message || err.error?.error || 'Código OTP incorrecto o expirado';
        this.onVerificationError(message);
      }
    });
  }

  private onVerificationError(message: string) {
    this.isVerifyingOtp = false;
    this.setAlert(message, 'danger');
    this.otp = ''; 
  }
}