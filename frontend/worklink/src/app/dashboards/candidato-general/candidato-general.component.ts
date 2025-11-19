import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-candidato-general',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidato-general.component.html',
  styleUrls: ['./candidato-general.component.css']
})
export class CandidatoGeneralComponent implements OnInit {

  usuario: any = null;
  aplicaciones: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioLogueado();
    this.cargarDashboardCandidato();
  }

  cargarDashboardCandidato(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.getMisAplicaciones().subscribe({
      next: (data) => {
        this.aplicaciones = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar aplicaciones:', err);
        this.errorMessage = 'No se pudieron cargar tus aplicaciones.';
        this.isLoading = false;
      }
    });
  }

  formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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