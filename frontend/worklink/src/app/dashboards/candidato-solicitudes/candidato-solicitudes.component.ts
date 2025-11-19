import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-candidato-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidato-solicitudes.component.html',
  styleUrls: ['./candidato-solicitudes.component.css']
})
export class CandidatoSolicitudesComponent implements OnInit {

  aplicaciones: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarAplicaciones();
  }
  cargarAplicaciones(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.getMisAplicaciones().subscribe({
      next: (data) => {
        this.aplicaciones = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar tus aplicaciones.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onEliminarAplicacion(idaplicacion: number): void {
    if (!confirm('¿Estás seguro de que quieres retirar tu aplicación?')) return;

    this.authService.eliminarAplicacion(idaplicacion).subscribe({
      next: () => {
        alert('Has retirado tu aplicación correctamente.');
        this.cargarAplicaciones(); // Recarga la lista
      },
      error: (err) => {
        const message = err.error?.message || 'No se pudo eliminar la aplicación.';
        alert(`Error: ${message}`);
      }
    });
  }

  formatearFecha(fechaISO: string): string {
    return new Date(fechaISO).toLocaleDateString('es-ES');
  }

  getStatusInfo(status: string): { texto: string, clase: string } {
    switch (status) {
      case 'Activa': return { texto: 'Activa', clase: 'bg-primary' };
      case 'En revisión': return { texto: 'En Revisión', clase: 'bg-warning text-dark' };
      case 'Aceptada': return { texto: 'Aceptada', clase: 'bg-success' };
      case 'Rechazada': return { texto: 'Rechazada', clase: 'bg-danger' };
      default: return { texto: status, clase: 'bg-secondary' };
    }
  }
}