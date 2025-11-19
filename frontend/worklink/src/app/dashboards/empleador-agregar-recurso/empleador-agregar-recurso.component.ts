import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-empleador-agregar-recurso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './empleador-agregar-recurso.component.html',
  styleUrls: ['./empleador-agregar-recurso.component.css']
})
export class EmpleadorAgregarRecursoComponent {

  recurso = {
    titulo: '',
    descripcion: '',
    tipoRecurso: '', 
    link: ''
  };

  isSubmitting: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.recurso.titulo || !this.recurso.link) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    this.isSubmitting = true;

    this.authService.crearRecurso(this.recurso).subscribe({
      next: () => {
        alert(' ¡Recurso publicado exitosamente!');
        
        setTimeout(() => {
          this.router.navigate(['/empleador/recursos']);
        }, 1000);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al publicar recurso:', err);
        
        let mensaje = err.error?.message || 'Ocurrió un error al publicar el recurso.';
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          mensaje = err.error.errors.map((e: any) => e.msg).join(', ');
        }
        
        alert(`Error: ${mensaje}`);
      }
    });
  }
}