// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormsModule, CommonModule, RouterLink],
  styleUrls: ['./login.css'] 
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  passwordFieldType: string = 'password';
  
  errorMessage: string | null = null;
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = null; 

    const credentials = {
      correo: this.loginData.email, 
      password: this.loginData.password
    };

    this.authService.login(credentials).subscribe({
      next: (data) => {
        this.authService.saveAuthData(data.token, data.usuario);
        
        if (data.usuario.rol === 'Empleador') {
          this.router.navigate(['/empleador/general']);
        } else {
          this.router.navigate(['/candidato/general']);
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        if (err.error.errors && Array.isArray(err.error.errors)) {
          this.errorMessage = err.error.errors.map((e: any) => e.msg).join('\n');
        } else {
          this.errorMessage = err.error.message || 'Error desconocido al iniciar sesión.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}