import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-empleador-mis-recursos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './empleador-mis-recursos.component.html',
  styleUrls: ['./empleador-mis-recursos.component.css']
})
export class EmpleadorMisRecursosComponent implements OnInit {

  recursos: any[] = [];
  estadisticas: any = {
    total: 0,
    cv: 0,
    entrevistas: 0,
    habilidades: 0
  };

  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarRecursos();
  }

  cargarRecursos(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.getMisRecursos().subscribe({
      next: (data) => {
        this.recursos = data;
        this.calcularEstadisticas(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando recursos:', err);
        this.errorMessage = 'No se pudieron cargar tus recursos.';
        this.isLoading = false;
      }
    });
  }

  calcularEstadisticas(recursos: any[]): void {
    this.estadisticas.total = recursos.length;
    this.estadisticas.cv = 0;
    this.estadisticas.entrevistas = 0;
    this.estadisticas.habilidades = 0;

    recursos.forEach(r => {
      const tipo = r.tipoRecurso;
      if (tipo === 'CV y cartas de presentación') this.estadisticas.cv++;
      else if (tipo === 'Preparación para entrevistas') this.estadisticas.entrevistas++;
      else if (tipo === 'Desarrollo de habilidades') this.estadisticas.habilidades++;
    });
  }

  eliminarRecurso(idRecurso: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este recurso? Esta acción no se puede deshacer.')) {
      return;
    }

    this.authService.eliminarRecurso(idRecurso).subscribe({
      next: () => {
        alert('Recurso eliminado exitosamente');
        this.cargarRecursos(); 
      },
      error: (err) => {
        alert(`Error: ${err.error?.message || 'No se pudo eliminar el recurso.'}`);
      }
    });
  }
}