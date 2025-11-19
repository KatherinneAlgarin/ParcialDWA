import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-empleador-mis-trabajos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './empleador-mis-trabajos.component.html',
  styleUrls: ['./empleador-mis-trabajos.component.css']
})
export class EmpleadorMisTrabajosComponent implements OnInit {

  ofertas: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.getMisOfertas().subscribe({
      next: (data) => {
        this.ofertas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorMessage = 'No se pudieron cargar las ofertas de trabajo.';
        this.isLoading = false;
      }
    });
  }

  eliminarOferta(idOferta: number): void {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oferta de trabajo? Esta acción no se puede deshacer.')) {
      return;
    }

    this.authService.eliminarOferta(idOferta).subscribe({
      next: () => {
        alert(' Oferta eliminada correctamente.');
        this.cargarOfertas(); 
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert(`Error: ${err.error?.message || 'No se pudo eliminar la oferta.'}`);
      }
    });
  }
}