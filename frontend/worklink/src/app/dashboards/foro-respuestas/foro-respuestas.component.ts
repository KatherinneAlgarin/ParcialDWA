import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { AuthService } from '../../services/auth';
import {NoApi} from '../../../environments/environments';
@Component({
  selector: 'app-foro-respuestas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './foro-respuestas.component.html',
  styleUrls: ['./foro-respuestas.component.css']
})
export class ForoRespuestasComponent implements OnInit {
  tema: any = null;
  respuestas: any[] = [];
  idForoActual: string | null = null;
  usuarioLogueado: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isSubmitting: boolean = false;

  nuevaRespuestaContenido: string = ''; 
  
  idRespuestaActiva: number | null = null; 
  textoRespuestaAnidada: string = '';    

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuarioLogueado = this.authService.getUsuarioLogueado();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idForoActual = id;
        this.cargarTemaCompleto();
      } else {
        this.errorMessage = 'Error: No se especificó un tema del foro.';
        this.isLoading = false;
      }
    });
  }

  cargarTemaCompleto(): void {
    if (!this.idForoActual) return;
    this.isLoading = true;

    this.authService.getForoDetalle(this.idForoActual).subscribe({
      next: (data) => {
        this.tema = data;
        this.respuestas = data.RespuestaForos || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar el tema del foro.';
        this.isLoading = false;
      }
    });
  }

  publicarRespuesta(parentId: number | null = null): void {
    if (!this.idForoActual) return;
    const contenido = parentId ? this.textoRespuestaAnidada : this.nuevaRespuestaContenido;

    if (!contenido.trim()) return;

    this.isSubmitting = true;
    this.authService.crearRespuesta(this.idForoActual, contenido, parentId ? String(parentId) : null).subscribe({
      next: () => {
        this.isSubmitting = false;
        
        // Limpiar formularios
        this.nuevaRespuestaContenido = '';
        this.textoRespuestaAnidada = '';
        this.idRespuestaActiva = null; 

        alert('Respuesta publicada correctamente.');
        this.cargarTemaCompleto(); 
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(`Error: ${err.error?.message || 'No se pudo publicar la respuesta.'}`);
      }
    });
  }
  activarResponder(idRespuesta: number): void {
  
    if (this.idRespuestaActiva === idRespuesta) {
      this.idRespuestaActiva = null;
    } else {
      this.idRespuestaActiva = idRespuesta;
      this.textoRespuestaAnidada = ''; 
    }
  }

  cancelarRespuestaAnidada(): void {
    this.idRespuestaActiva = null;
    this.textoRespuestaAnidada = '';
  }
  getFotoPerfil(usuario: any): string {
    if (usuario && usuario.foto_perfil) {
      return `${NoApi.apiUrl}/uploads/fotoPerfil/${usuario.foto_perfil}`;
    }
    return 'assets/imagenes/imagen.png';
  }
  formatearFecha(fechaISO: string): string {
    if (!fechaISO) return 'Fecha desconocida';
    
    const fecha = new Date(fechaISO);
    
    // Verifica si la fecha es válida
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida'; 
    }

    return fecha.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}