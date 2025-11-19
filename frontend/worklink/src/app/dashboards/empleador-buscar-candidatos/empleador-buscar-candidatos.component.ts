import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth';
import { forkJoin } from 'rxjs';
import {NoApi} from '../../../environments/environments';
declare var bootstrap: any;

@Component({
  selector: 'app-empleador-buscar-candidatos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleador-buscar-candidatos.component.html',
  styleUrls: ['./empleador-buscar-candidatos.component.css']
})
export class EmpleadorBuscarCandidatosComponent implements OnInit {

  // Datos
  todasLasAplicaciones: any[] = [];
  aplicacionesFiltradas: any[] = [];
  ofertasDelEmpleador: any[] = [];
  
  // Filtros
  filtroOfertaId: string = '';
  filtroNombre: string = '';

  // UI
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Modal
  candidatoSeleccionado: any = null;
  aplicacionSeleccionada: any = null;
  redesSocialesCandidato: any = null;
  private perfilModal: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
    
    const modalEl = document.getElementById('perfilModal');
    if (modalEl) {
      this.perfilModal = new bootstrap.Modal(modalEl);
    }
  }

  cargarDatosIniciales(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      ofertas: this.authService.getMisOfertas(),
      aplicaciones: this.authService.getTodasAplicacionesEmpresa()
    }).subscribe({
      next: ({ ofertas, aplicaciones }) => {
        this.ofertasDelEmpleador = ofertas;
        this.todasLasAplicaciones = aplicaciones;
        this.aplicacionesFiltradas = aplicaciones;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.errorMessage = 'No se pudieron cargar los datos.';
        this.isLoading = false;
      }
    });
  }

  filtrarCandidatos(): void {
    let resultado = this.todasLasAplicaciones;
    if (this.filtroOfertaId) {
      resultado = resultado.filter(app => app.idoferta == this.filtroOfertaId);
    }

    if (this.filtroNombre.trim()) {
      const nombre = this.filtroNombre.toLowerCase();
      resultado = resultado.filter(app => 
        app.Usuario.nombre.toLowerCase().includes(nombre)
      );
    }

    this.aplicacionesFiltradas = resultado;
  }

  actualizarEstado(aplicacion: any, nuevoEstado: string): void {
    this.authService.actualizarEstadoAplicacion(aplicacion.idaplicacion, nuevoEstado).subscribe({
      next: () => {
        aplicacion.estado = nuevoEstado;
      },
      error: (err) => {
        alert(`Error: ${err.error?.message || 'No se pudo actualizar el estado.'}`);
      }
    });
  }

  verPerfil(aplicacion: any): void {
    if (!aplicacion || !aplicacion.Usuario) {
      alert('No se pudo encontrar la información del candidato.');
      return;
    }
    this.candidatoSeleccionado = aplicacion.Usuario;
    this.aplicacionSeleccionada = aplicacion;
    try {
      this.redesSocialesCandidato = this.candidatoSeleccionado.redes_sociales 
        ? JSON.parse(this.candidatoSeleccionado.redes_sociales) : null;
    } catch (e) { this.redesSocialesCandidato = null; }

    this.perfilModal.show();
  }

  getFotoUrl(usuario: any): string {
    if (usuario && usuario.foto_perfil) {
      return `${NoApi.apiUrl}/uploads/fotoPerfil/${usuario.foto_perfil}`;
    }
    return 'assets/imagenes/imagen.png';
  }

  getCvUrl(cvPath: string): string {
    return `${NoApi.apiUrl}/uploads/curriculums/${cvPath}`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}