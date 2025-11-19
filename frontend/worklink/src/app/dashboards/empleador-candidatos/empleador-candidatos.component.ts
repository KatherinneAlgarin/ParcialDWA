import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { AuthService } from '../../services/auth';
import {NoApi} from '../../../environments/environments';
declare var bootstrap: any;

@Component({
  selector: 'app-empleador-candidatos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './empleador-candidatos.component.html',
  styleUrls: ['./empleador-candidatos.component.css']
})
export class EmpleadorCandidatosComponent implements OnInit {

  aplicaciones: any[] = [];
  tituloOferta: string = 'Cargando...';
  idOfertaActual: string | null = null;
  
  isLoading: boolean = true;
  errorMessage: string | null = null;

  candidatoSeleccionado: any = null;
  aplicacionSeleccionada: any = null; 
  redesSocialesCandidato: any = null;
  private perfilModal: any;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idOfertaActual = id;
        this.cargarCandidatos();
      } else {
        this.errorMessage = 'Error: No se especificó una oferta.';
        this.isLoading = false;
      }
    });

    const modalEl = document.getElementById('perfilModal');
    if (modalEl) {
      this.perfilModal = new bootstrap.Modal(modalEl);
    }
  }

  cargarCandidatos(): void {
    if (!this.idOfertaActual) return;
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.getCandidatosDeOferta(this.idOfertaActual).subscribe({
      next: (data) => {
        this.aplicaciones = data;
        
        if (data.length > 0 && data[0].Oferta) {
          this.tituloOferta = `Candidatos para: ${data[0].Oferta.titulo}`;
        } else {
          this.tituloOferta = 'Candidatos';
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorMessage = err.error?.message || 'No se pudieron cargar los candidatos.';
        this.isLoading = false;
      }
    });
  }

  actualizarEstado(aplicacion: any, nuevoEstado: string): void {
    this.authService.actualizarEstadoAplicacion(aplicacion.idaplicacion, nuevoEstado).subscribe({
      next: () => {

        aplicacion.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
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
        ? JSON.parse(this.candidatoSeleccionado.redes_sociales) 
        : null;
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
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}