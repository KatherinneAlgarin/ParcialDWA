// File: frontend/worklink/src/app/components/register/register.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-register',
  imports: [
    CommonModule,   
    FormsModule,    
    RouterModule    
  ],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegisterComponent {
  registerData = {
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
    rolIndex: '' 
  };

  errorMessage: string | null = null;

  passFieldType: string = 'password';
  confirmPassFieldType: string = 'password';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = null;

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    let rol = "";
    if (this.registerData.rolIndex === "1") rol = "Empleador";
    else if (this.registerData.rolIndex === "2") rol = "Candidato";

    const apiData = {
      nombre: this.registerData.nombre,
      correo: this.registerData.correo,
      password: this.registerData.password,
      rol: rol
    };

    this.authService.register(apiData).subscribe({
  
      next: (data) => {
        alert('Cuenta creada con éxito.'); 
        this.router.navigate(['/login']); 
      },
      // Caso de ERROR
      error: (err) => {
        console.error('Error en el registro:', err);
        if (err.error.errors && Array.isArray(err.error.errors)) {
          this.errorMessage = err.error.errors.map((e: any) => e.msg).join('\n');
        } else {
          this.errorMessage = err.error.message || 'Error desconocido al crear la cuenta.';
        }
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