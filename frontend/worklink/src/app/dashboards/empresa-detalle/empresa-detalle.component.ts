import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { AuthService } from '../../services/auth';
import { forkJoin } from 'rxjs';
import {NoApi} from '../../../environments/environments';
declare var bootstrap: any;

@Component({
  selector: 'app-empresa-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './empresa-detalle.component.html',
  styleUrls: ['./empresa-detalle.component.css']
})
export class EmpresaDetalleComponent implements OnInit {
  imgTimestamp: number = Date.now();
  empresa: any = null;
  resenas: any[] = [];
  redesSociales: any = null;
  idEmpresa: string | null = null;
  usuarioLogueado: any = null;

  // --- UI ---
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isSubmitting: boolean = false;

  // --- Modal Valoración ---
  private modalValorar: any;
  modoEdicion = false;
  idResenaEdicion: string | null = null;
  
  formValoracion = {
    calificacion: 0,
    comentario: ''
  };
  
  hoverRating = 0;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuarioLogueado = this.authService.getUsuarioLogueado();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idEmpresa = id;
        this.cargarPaginaCompleta();
      } else {
        this.errorMessage = 'ID de empresa no proporcionado.';
        this.isLoading = false;
      }
    });

    const modalEl = document.getElementById('modal-valorar');
    if (modalEl) {
      this.modalValorar = new bootstrap.Modal(modalEl);
    }
  }

  cargarPaginaCompleta(): void {
    if (!this.idEmpresa) return;
    this.isLoading = true;

    forkJoin({
      empresa: this.authService.getEmpresaDetalle(this.idEmpresa),
      resenas: this.authService.getResenasEmpresa(this.idEmpresa)
    }).subscribe({
      next: ({ empresa, resenas }) => {
        this.empresa = empresa;
        this.resenas = resenas || [];
        
        try {
          this.redesSociales = empresa.redesSociales ? JSON.parse(empresa.redesSociales) : null;
        } catch (e) { this.redesSociales = null; }

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar la información de la empresa.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  abrirModalValorar(): void {
    if (!this.usuarioLogueado) {
      alert('Debes iniciar sesión para valorar una empresa.');
      
      return;
    }
    if (this.usuarioLogueado.rol === 'Empleador' && String(this.usuarioLogueado.idempresa) === String(this.idEmpresa)) {
      alert('No puedes valorar tu propia empresa.');
      return;
    }

    this.modoEdicion = false;
    this.formValoracion = { calificacion: 0, comentario: '' };
    this.modalValorar.show();
  }

  abrirModalEditar(resena: any): void {
    this.modoEdicion = true;
    this.idResenaEdicion = resena.idcalificacion;
    this.formValoracion = {
      calificacion: resena.calificacion,
      comentario: resena.comentario
    };
    this.modalValorar.show();
  }

  enviarValoracion(): void {
    if (this.formValoracion.calificacion < 1) {
      alert('Por favor selecciona una calificación.');
      return;
    }
    if (!this.formValoracion.comentario.trim()) {
      alert('Por favor escribe un comentario.');
      return;
    }

    this.isSubmitting = true;
    let peticion;

    if (this.modoEdicion && this.idResenaEdicion) {
      peticion = this.authService.actualizarResena(this.idResenaEdicion, this.formValoracion);
    } else if (this.idEmpresa) {
      peticion = this.authService.crearResena(this.idEmpresa, this.formValoracion);
    } else {
      return;
    }

    peticion.subscribe({
      next: () => {
        this.isSubmitting = false;
        alert(`¡Valoración ${this.modoEdicion ? 'actualizada' : 'publicada'} correctamente!`);
        this.modalValorar.hide();
        this.cargarPaginaCompleta(); // Recarga para ver cambios
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(`Error: ${err.error?.message || 'Error al procesar la reseña'}`);
      }
    });
  }

  eliminarResena(idResena: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar tu reseña?')) return;

    this.authService.eliminarResena(idResena).subscribe({
      next: () => {
        alert('Reseña eliminada correctamente.');
        this.cargarPaginaCompleta();
      },
      error: (err) => {
        alert(`Error: ${err.error?.message || 'Error al eliminar la reseña'}`);
      }
    });
  }
  setRating(val: number): void {
    this.formValoracion.calificacion = val;
  }

  getLogoUrl(logo: string | null): string {
    if (logo) {
      return `${NoApi.apiUrl}/uploads/fotoPerfil/${logo}?t=${this.imgTimestamp}`;
    }
    return 'assets/imagenes/Logo.jpg';
  }

  getFotoUsuario(foto: string | null): string {
    if (foto) {
      return `${NoApi.apiUrl}/uploads/fotoPerfil/${foto}?t=${this.imgTimestamp}`;
    }
    return 'assets/imagenes/Logo.jpg';
  }

  getEstrellasArray(valoracion: number): string[] {
    const rating = parseFloat(String(valoracion)) || 0;
    const estrellas: string[] = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(i <= rating ? 'full' : 'empty');
    }
    return estrellas;
  }

  esAutor(resena: any): boolean {
    return this.usuarioLogueado && resena.Usuario && this.usuarioLogueado.id === resena.Usuario.id;
  }
  
  formatearFecha(fechaISO: string): string {
    return new Date(fechaISO).toLocaleDateString('es-ES');
  }
}