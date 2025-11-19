// File: frontend/worklink/src/app/components/reset-password/reset-password.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {

  passwordData = {
    nuevaPassword: '',
    confirmarPassword: ''
  };

  isSubmitting: boolean = false;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'danger';

  passFieldType: string = 'password';
  confirmPassFieldType: string = 'password';

  private correo: string | null = null;
  private otp: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.correo = sessionStorage.getItem('recovery_email');
    this.otp = sessionStorage.getItem('recovery_otp');

    if (!this.correo || !this.otp) {
      alert('Sesión inválida. Por favor, solicita un nuevo código.');
      this.router.navigate(['/recover-password']);
    }
  }

  private setAlert(message: string, type: 'success' | 'danger' = 'danger') {
    this.alertMessage = message;
    this.alertType = type;
  }

  onSubmit() {
    this.alertMessage = null;

    if (this.passwordData.nuevaPassword.length < 6) {
      this.setAlert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (this.passwordData.nuevaPassword !== this.passwordData.confirmarPassword) {
      this.setAlert('Las contraseñas no coinciden');
      return;
    }

    if (!this.correo || !this.otp) {
      this.router.navigate(['/recover-password']);
      return;
    }

    this.isSubmitting = true;

    this.authService.resetPassword(this.correo, this.otp, this.passwordData.nuevaPassword)
      .subscribe({
        next: (response) => {
        
          sessionStorage.removeItem('recovery_email');
          sessionStorage.removeItem('recovery_otp');

          this.setAlert('¡Contraseña restablecida! Redirigiendo al login...', 'success');

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
  
          const message = err.error?.message || err.error?.error || 'Error al restablecer la contraseña';
          this.setAlert(message, 'danger');
          this.isSubmitting = false;
        }
      });
  }
  togglePasswordVisibility(field: 'pass' | 'confirm'): void {
    if (field === 'pass') {
      this.passFieldType = this.passFieldType === 'password' ? 'text' : 'password';
    } else {
      this.confirmPassFieldType = this.confirmPassFieldType === 'password' ? 'text' : 'password';
    }
  }
}